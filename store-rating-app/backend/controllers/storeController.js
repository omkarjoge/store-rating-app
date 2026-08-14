const pool = require('../config/db');

const ALLOWED_SORT = new Set(['name', 'address', 'rating']);

function sortDirection(dir) {
  return String(dir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
}

// GET /api/stores?name=&address=&sortBy=&sortDir=
// Available to any authenticated NORMAL user. Includes the requesting
// user's own submitted rating for each store (null if not yet rated).
async function listStores(req, res) {
  const { name = '', address = '', sortBy = 'name', sortDir = 'asc' } = req.query;
  const userId = req.user.id;

  const col = ALLOWED_SORT.has(sortBy) ? sortBy : 'name';
  const dir = sortDirection(sortDir);
  const orderCol = col === 'rating' ? 'overall_rating' : `s.${col}`;

  const conditions = [];
  const params = [userId];

  if (name) {
    params.push(`%${name}%`);
    conditions.push(`s.name ILIKE $${params.length}`);
  }
  if (address) {
    params.push(`%${address}%`);
    conditions.push(`s.address ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const query = `
      SELECT s.id, s.name, s.address, s.email,
             COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS overall_rating,
             COUNT(r.id)::int AS rating_count,
             (SELECT rating FROM ratings ur WHERE ur.store_id = s.id AND ur.user_id = $1) AS user_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      ${where}
      GROUP BY s.id
      ORDER BY ${orderCol} ${dir}
    `;
    const result = await pool.query(query, params);
    res.json({ stores: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stores' });
  }
}

module.exports = { listStores };
