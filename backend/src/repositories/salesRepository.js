
// NOTE: Sale creation uses a DB client (not pool.query) because the
// entire operation must run on ONE connection inside BEGIN...COMMIT.
// The client is passed in from the service layer.

import { query } from '../config/db.js';

// Lock inventory rows for all items — prevents concurrent oversell
export const lockInventoryRows = async (client, outletId, menuItemIds) => {
  const { rows } = await client.query(
    `SELECT id, menu_item_id, quantity_on_hand
     FROM inventory
     WHERE outlet_id = $1
       AND menu_item_id = ANY($2::int[])
     FOR UPDATE`,
    [outletId, menuItemIds]
  );
  return rows;
};

// Deduct stock for one item
export const deductStock = async (client, outletId, menuItemId, quantity) => {
  await client.query(
    `UPDATE inventory
     SET quantity_on_hand = quantity_on_hand - $1
     WHERE outlet_id = $2 AND menu_item_id = $3`,
    [quantity, outletId, menuItemId]
  );
};

// Lock counter row and get next sequence number
export const incrementReceiptCounter = async (client, outletId) => {
  // Lock this outlet's counter row
  await client.query(
    `SELECT last_sequence FROM outlet_receipt_counters
     WHERE outlet_id = $1 FOR UPDATE`,
    [outletId]
  );

  // Increment and return new sequence
  const { rows } = await client.query(
    `INSERT INTO outlet_receipt_counters (outlet_id, last_sequence)
     VALUES ($1, 1)
     ON CONFLICT (outlet_id)
     DO UPDATE SET last_sequence = outlet_receipt_counters.last_sequence + 1
     RETURNING last_sequence`,
    [outletId]
  );
  return rows[0].last_sequence;
};

export const createTransaction = async (client, { outlet_id, receipt_number, total_amount, notes }) => {
  const { rows } = await client.query(
    `INSERT INTO transactions (outlet_id, receipt_number, total_amount, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING id, outlet_id, receipt_number, total_amount, status, notes, created_at`,
    [outlet_id, receipt_number, total_amount, notes ?? null]
  );
  return rows[0];
};

export const createTransactionItems = async (client, transactionId, items) => {
  // Bulk insert all line items at once
  const values = items.map((_, i) => {
    const base = i * 4;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
  }).join(', ');

  const params = items.flatMap(({ menu_item_id, quantity, unit_price, subtotal }) => [
    transactionId, menu_item_id, quantity, unit_price, // subtotal calculated below
  ]);

  // Rebuild with subtotal included
  const valuesWithSubtotal = items.map((_, i) => {
    const base = i * 5;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
  }).join(', ');

  const paramsWithSubtotal = items.flatMap(({ menu_item_id, quantity, unit_price, subtotal }) => [
    transactionId, menu_item_id, quantity, unit_price, subtotal,
  ]);

  const { rows } = await client.query(
    `INSERT INTO transaction_items (transaction_id, menu_item_id, quantity, unit_price, subtotal)
     VALUES ${valuesWithSubtotal}
     RETURNING *`,
    paramsWithSubtotal
  );
  return rows;
};

// Regular queries (pool)

export const findByOutlet = async (outletId, { limit = 20, offset = 0, from, to }) => {
  let sql = `
    SELECT id, outlet_id, receipt_number, total_amount, status, notes, created_at
    FROM transactions
    WHERE outlet_id = $1`;
  const params = [outletId];

  if (from) {
    params.push(from);
    sql += ` AND created_at >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    sql += ` AND created_at <= $${params.length}::date + interval '1 day'`;
  }

  params.push(limit, offset);
  sql += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const { rows } = await query(sql, params);
  return rows;
};

export const findByReceiptNumber = async (outletId, receiptNumber) => {
  const { rows } = await query(
    `SELECT
       t.id, t.outlet_id, t.receipt_number, t.total_amount, t.status, t.notes, t.created_at,
       json_agg(json_build_object(
         'id',             ti.id,
         'menu_item_id',   ti.menu_item_id,
         'menu_item_name', mi.name,
         'quantity',       ti.quantity,
         'unit_price',     ti.unit_price,
         'subtotal',       ti.subtotal
       ) ORDER BY ti.id) AS items
     FROM transactions t
     JOIN transaction_items ti ON ti.transaction_id = t.id
     JOIN menu_items mi         ON mi.id = ti.menu_item_id
     WHERE t.outlet_id = $1 AND t.receipt_number = $2
     GROUP BY t.id`,
    [outletId, receiptNumber]
  );
  return rows[0] ?? null;
};

// Get effective prices for items from outlet_menu_items
export const getEffectivePrices = async (client, outletId, menuItemIds) => {
  const { rows } = await client.query(
    `SELECT
       omi.menu_item_id,
       mi.name,
       COALESCE(omi.override_price, mi.base_price) AS effective_price
     FROM outlet_menu_items omi
     JOIN menu_items mi ON mi.id = omi.menu_item_id
     WHERE omi.outlet_id = $1
       AND omi.menu_item_id = ANY($2::int[])
       AND omi.is_available = TRUE
       AND mi.is_active = TRUE`,
    [outletId, menuItemIds]
  );
  return rows;
};
