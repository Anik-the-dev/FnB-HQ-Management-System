
import { query } from '../config/db.js';

const COMPANY_ID = 1; // Mother Company ID, In Scale there can be sister company..

export const findAll = async ({ category, isActive }) => {
  let sql = `
    SELECT id, company_id, name, description, base_price, category, is_active, created_at, updated_at
    FROM menu_items
    WHERE company_id = $1`;
  const params = [COMPANY_ID];

  if (category) {
    params.push(category);
    sql += ` AND category = $${params.length}`;
  }
  if (isActive !== undefined) {
    params.push(isActive);
    sql += ` AND is_active = $${params.length}`;
  }

  sql += ` ORDER BY category, name`;
  const { rows } = await query(sql, params);
  return rows;
};

export const findById = async (id) => {
  const { rows } = await query(
    `SELECT id, company_id, name, description, base_price, category, is_active, created_at, updated_at
     FROM menu_items WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
};

export const create = async ({ name, description, base_price, category }) => {
  const { rows } = await query(
    `INSERT INTO menu_items (company_id, name, description, base_price, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, company_id, name, description, base_price, category, is_active, created_at, updated_at`,
    [COMPANY_ID, name, description ?? null, base_price, category ?? null]
  );
  return rows[0];
};

export const update = async (id, fields) => {
  const { name, description, base_price, category, is_active } = fields;
  const { rows } = await query(
    `UPDATE menu_items
     SET name        = COALESCE($1, name),
         description = COALESCE($2, description),
         base_price  = COALESCE($3, base_price),
         category    = COALESCE($4, category),
         is_active   = COALESCE($5, is_active)
     WHERE id = $6
     RETURNING id, company_id, name, description, base_price, category, is_active, created_at, updated_at`,
    [name ?? null, description ?? null, base_price ?? null, category ?? null, is_active ?? null, id]
  );
  return rows[0] ?? null;
};

export const softDelete = async (id) => {
  const { rows } = await query(
    `UPDATE menu_items SET is_active = FALSE
     WHERE id = $1
     RETURNING id, name, is_active`,
    [id]
  );
  return rows[0] ?? null;
};
