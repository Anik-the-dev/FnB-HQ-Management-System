import { query } from "../config/db.js";

const COMPANY_ID = 1; // Mother Company ID, In Scale there can be sister company..

export const getRevenueByOutlet = async ({ from, to }) => {
  let sql = `
    SELECT
      o.id          AS outlet_id,
      o.name        AS outlet_name,
      COUNT(t.id)   AS total_sales,
      COALESCE(SUM(t.total_amount), 0) AS total_revenue
    FROM outlets o
    LEFT JOIN transactions t
      ON t.outlet_id = o.id
      AND t.status = 'COMPLETED'`;

  const params = [COMPANY_ID];

  if (from) {
    params.push(from);
    sql += ` AND t.created_at >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    sql += ` AND t.created_at <= $${params.length}::date + interval '1 day'`;
  }

  sql += `
    WHERE o.company_id = $1
    GROUP BY o.id, o.name
    ORDER BY total_revenue DESC`;

  const { rows } = await query(sql, params);
  return rows;
};

export const getTopItemsByOutlet = async (
  outletId,
  { from, to, limit = 5 },
) => {
  let sql = `
    SELECT
      mi.id              AS menu_item_id,
      mi.name,
      SUM(ti.quantity)   AS total_quantity,
      SUM(ti.subtotal)   AS total_revenue,
      RANK() OVER (ORDER BY SUM(ti.quantity) DESC) AS rank
    FROM transaction_items ti
    JOIN transactions t  ON t.id  = ti.transaction_id
    JOIN menu_items   mi ON mi.id = ti.menu_item_id
    WHERE t.outlet_id = $1
      AND t.status = 'COMPLETED'`;

  const params = [outletId];

  if (from) {
    params.push(from);
    sql += ` AND t.created_at >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    sql += ` AND t.created_at <= $${params.length}::date + interval '1 day'`;
  }

  sql += `
    GROUP BY mi.id, mi.name
    ORDER BY total_quantity DESC
    LIMIT $${params.length + 1}`;

  params.push(limit);

  const { rows } = await query(sql, params);
  return rows;
};
