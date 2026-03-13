import { query } from "../config/db.js";

const COMPANY_ID = 1; // Mother Company ID, In Scale there can be sister company..

export const findAll = async () => {
  const { rows } = await query(
    `SELECT id, company_id, name, location, is_active, created_at, updated_at
     FROM outlets
     WHERE company_id = $1
     ORDER BY id ASC`,
    [COMPANY_ID],
  );
  return rows;
};

export const findById = async (id) => {
  const { rows } = await query(
    `SELECT id, company_id, name, location, is_active, created_at, updated_at
     FROM outlets WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
};

export const create = async ({ name, location }) => {
  const { rows } = await query(
    `INSERT INTO outlets (company_id, name, location)
     VALUES ($1, $2, $3)
     RETURNING id, company_id, name, location, is_active, created_at, updated_at`,
    [COMPANY_ID, name, location ?? null],
  );
  return rows[0];
};

export const update = async (id, fields) => {
  const { name, location, is_active } = fields;
  const { rows } = await query(
    `UPDATE outlets
     SET name      = COALESCE($1, name),
         location  = COALESCE($2, location),
         is_active = COALESCE($3, is_active)
     WHERE id = $4
     RETURNING id, company_id, name, location, is_active, created_at, updated_at`,
    [name ?? null, location ?? null, is_active ?? null, id],
  );
  return rows[0] ?? null;
};

// Outlet Menu Assignment

export const findOutletMenu = async (outletId) => {
  const { rows } = await query(
    `SELECT
       omi.id            AS outlet_menu_item_id,
       mi.id             AS menu_item_id,
       mi.name,
       mi.description,
       mi.category,
       mi.base_price,
       omi.override_price,
       COALESCE(omi.override_price, mi.base_price) AS effective_price,
       omi.is_available
     FROM outlet_menu_items omi
     JOIN menu_items mi ON mi.id = omi.menu_item_id
     WHERE omi.outlet_id = $1
       AND mi.is_active = TRUE
     ORDER BY mi.category, mi.name`,
    [outletId],
  );
  return rows;
};

export const findOutletMenuItem = async (outletId, menuItemId) => {
  const { rows } = await query(
    `SELECT * FROM outlet_menu_items
     WHERE outlet_id = $1 AND menu_item_id = $2`,
    [outletId, menuItemId],
  );
  return rows[0] ?? null;
};

export const assignMenuItem = async ({
  outlet_id,
  menu_item_id,
  override_price,
}) => {
  const { rows } = await query(
    `INSERT INTO outlet_menu_items (outlet_id, menu_item_id, override_price)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [outlet_id, menu_item_id, override_price ?? null],
  );
  return rows[0];
};

export const updateMenuItemAssignment = async (
  outletId,
  menuItemId,
  fields,
) => {
  const { override_price, is_available } = fields;
  const { rows } = await query(
    `UPDATE outlet_menu_items
     SET override_price = COALESCE($1, override_price),
         is_available   = COALESCE($2, is_available)
     WHERE outlet_id = $3 AND menu_item_id = $4
     RETURNING *`,
    [override_price ?? null, is_available ?? null, outletId, menuItemId],
  );
  return rows[0] ?? null;
};

export const removeMenuItemAssignment = async (outletId, menuItemId) => {
  const { rowCount } = await query(
    `DELETE FROM outlet_menu_items
     WHERE outlet_id = $1 AND menu_item_id = $2`,
    [outletId, menuItemId],
  );
  return rowCount > 0;
};
