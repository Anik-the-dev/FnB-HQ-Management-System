import { query } from "../config/db.js";

export const findAll = async () => {
  const { rows } = await query(
    `SELECT id, name, created_at, updated_at
     FROM companies
     ORDER BY id ASC`,
  );
  return rows;
};

export const findById = async (id) => {
  const { rows } = await query(
    `SELECT id, name, created_at, updated_at
     FROM companies WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
};

export const create = async (name) => {
  const { rows } = await query(
    `INSERT INTO companies (name)
     VALUES ($1)
     RETURNING id, name, created_at, updated_at`,
    [name],
  );
  return rows[0];
};

export const update = async (id, name) => {
  const { rows } = await query(
    `UPDATE companies SET name = $1
     WHERE id = $2
     RETURNING id, name, created_at, updated_at`,
    [name, id],
  );
  return rows[0] ?? null;
};

