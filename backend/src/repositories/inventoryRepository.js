import { query } from '../config/db.js';

export const findByOutlet = async (outletId) => {
  const { rows } = await query(
    `SELECT
       i.id, i.outlet_id, i.menu_item_id,
       mi.name AS menu_item_name,
       mi.category,
       i.quantity_on_hand,
       i.low_stock_threshold,
       i.updated_at
     FROM inventory i
     JOIN menu_items mi ON mi.id = i.menu_item_id
     WHERE i.outlet_id = $1
     ORDER BY mi.category, mi.name`,
    [outletId]
  );
  return rows;
};

export const findOne = async (outletId, menuItemId) => {
  const { rows } = await query(
    `SELECT * FROM inventory
     WHERE outlet_id = $1 AND menu_item_id = $2`,
    [outletId, menuItemId]
  );
  return rows[0] ?? null;
};

// Set absolute stock level (upsert)
export const setStock = async (outletId, menuItemId, quantity, lowStockThreshold) => {
  const { rows } = await query(
    `INSERT INTO inventory (outlet_id, menu_item_id, quantity_on_hand, low_stock_threshold)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (outlet_id, menu_item_id)
     DO UPDATE SET
       quantity_on_hand    = $3,
       low_stock_threshold = COALESCE($4, inventory.low_stock_threshold)
     RETURNING *`,
    [outletId, menuItemId, quantity, lowStockThreshold ?? 10]
  );
  return rows[0];
};

// Adjust stock by delta — DB CHECK constraint prevents going below 0
export const adjustStock = async (outletId, menuItemId, adjustment) => {
  const { rows } = await query(
    `UPDATE inventory
     SET quantity_on_hand = quantity_on_hand + $1
     WHERE outlet_id = $2 AND menu_item_id = $3
     RETURNING *`,
    [adjustment, outletId, menuItemId]
  );
  return rows[0] ?? null;
};

