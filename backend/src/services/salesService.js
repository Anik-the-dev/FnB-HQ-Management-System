import { getClient } from "../config/db.js";
import * as salesRepo from "../repositories/salesRepository.js";
import { buildReceiptNumber } from "../utils/receiptNumber.js";

export const createSale = async ({ outlet_id, items, notes }) => {
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const menuItemIds = items.map((i) => i.menu_item_id);

    // Verify all items are assigned, get effective prices
    const pricedItems = await salesRepo.getEffectivePrices(
      client,
      outlet_id,
      menuItemIds,
    );

    if (pricedItems.length !== menuItemIds.length) {
      const foundIds = pricedItems.map((p) => p.menu_item_id);
      const missingIds = menuItemIds.filter((id) => !foundIds.includes(id));
      const err = new Error(
        `Menu items not available at this outlet: ${missingIds.join(", ")}`,
      );
      err.statusCode = 400;
      throw err;
    }

    // Build price map
    const priceMap = Object.fromEntries(
      pricedItems.map((p) => [
        p.menu_item_id,
        { price: parseFloat(p.effective_price), name: p.name },
      ]),
    );

    // Lock inventory rows
    const inventoryRows = await salesRepo.lockInventoryRows(
      client,
      outlet_id,
      menuItemIds,
    );

    // Build stock map
    const stockMap = Object.fromEntries(
      inventoryRows.map((r) => [r.menu_item_id, r.quantity_on_hand]),
    );

    // Validate stock for ALL items before deducting any
    const stockErrors = [];
    for (const item of items) {
      const available = stockMap[item.menu_item_id] ?? 0;
      if (available < item.quantity) {
        stockErrors.push({
          menu_item_id: item.menu_item_id,
          name: priceMap[item.menu_item_id]?.name,
          requested: item.quantity,
          available,
        });
      }
    }

    if (stockErrors.length > 0) {
      const err = new Error("Insufficient stock for one or more items");
      err.statusCode = 400;
      err.details = stockErrors;
      throw err;
    }

    // Deduct stock atomically 
    for (const item of items) {
      await salesRepo.deductStock(
        client,
        outlet_id,
        item.menu_item_id,
        item.quantity,
      );
    }

    //Get next receipt sequence (locked)
    const sequence = await salesRepo.incrementReceiptCounter(client, outlet_id);
    const receiptNumber = buildReceiptNumber(outlet_id, sequence);

    // Build line items with snapshotted prices
    const lineItems = items.map((item) => {
      const unit_price = priceMap[item.menu_item_id].price;
      return {
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price,
        subtotal: parseFloat((unit_price * item.quantity).toFixed(2)),
      };
    });

    const total_amount = lineItems.reduce((sum, i) => sum + i.subtotal, 0);

    // Insert transaction header
    const transaction = await salesRepo.createTransaction(client, {
      outlet_id,
      receipt_number: receiptNumber,
      total_amount: parseFloat(total_amount.toFixed(2)),
      notes,
    });

    // Insert line items 
    const transactionItems = await salesRepo.createTransactionItems(
      client,
      transaction.id,
      lineItems,
    );

    await client.query("COMMIT");

    // Return full receipt
    return {
      ...transaction,
      items: transactionItems.map((ti) => ({
        id: ti.id,
        menu_item_id: ti.menu_item_id,
        menu_item_name: priceMap[ti.menu_item_id]?.name,
        quantity: ti.quantity,
        unit_price: parseFloat(ti.unit_price),
        subtotal: parseFloat(ti.subtotal),
      })),
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getSalesByOutlet = async (outletId, filters) => {
  return salesRepo.findByOutlet(outletId, filters);
};

export const getSaleByReceipt = async (outletId, receiptNumber) => {
  const sale = await salesRepo.findByReceiptNumber(outletId, receiptNumber);
  if (!sale) {
    const err = new Error("Sale not found");
    err.statusCode = 404;
    throw err;
  }
  return sale;
};
