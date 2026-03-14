
import { query } from '../config/db.js';

const userRepository = {

  async findByUsername(username) {
    const { rows } = await query(
      `SELECT id, username, password, role, outlet_id, is_active
       FROM users WHERE username = $1`,
      [username]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT id, username, role, outlet_id, is_active
       FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT id, username, role, outlet_id, is_active
       FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findAll() {
    const { rows } = await query(
      `SELECT u.id, u.username, u.role, u.outlet_id, u.is_active,
              o.name AS outlet_name, u.created_at
       FROM users u
       LEFT JOIN outlets o ON o.id = u.outlet_id
       ORDER BY u.id`
    );
    return rows;
  },

  async create({ username, password, role, outlet_id }) {
    const { rows } = await query(
      `INSERT INTO users (username, password, role, outlet_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, role, outlet_id, is_active, created_at`,
      [username, password, role, outlet_id || null]
    );
    return rows[0];
  },

  async setActive(id, is_active) {
    const { rows } = await query(
      `UPDATE users SET is_active = $1 WHERE id = $2
       RETURNING id, username, role, outlet_id, is_active`,
      [is_active, id]
    );
    return rows[0] || null;
  },
};

export default userRepository;
