const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const ALLOWED_USER_SORT = new Set(['name', 'email', 'address', 'role', 'created_at']);
const ALLOWED_STORE_SORT = new Set(['name', 'email', 'address', 'rating', 'created_at']);

function sortDirection(dir) {
  return String(dir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
}

// GET /api/admin/dashboard
async function dashboard(req, res) {
  try {
    const [users, stores, ratings] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM stores'),
      pool.query('SELECT COUNT(*)::int AS count FROM ratings'),
    ]);

    res.json({
      totalUsers: users.rows[0].count,
      totalStores: stores.rows[0].count,
      totalRatings: ratings.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
}

// POST /api/admin/users  (create admin or normal user)
async function createUser(req, res) {
  const { name, email, password, address, role } = req.body;
  const finalRole = ['ADMIN', 'NORMAL', 'STORE_OWNER'].includes(role) ? role : 'NORMAL';

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [name, email, passwordHash, address, finalRole]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create user' });
  }
}

// GET /api/admin/users?name=&email=&address=&role=&sortBy=&sortDir=
async function listUsers(req, res) {
  const { name = '', email = '', address = '', role = '', sortBy = 'name', sortDir = 'asc' } = req.query;

  const col = ALLOWED_USER_SORT.has(sortBy) ? sortBy : 'name';
  const dir = sortDirection(sortDir);

  const conditions = [];
  const params = [];

  if (name) {
    params.push(`%${name}%`);
    conditions.push(`u.name ILIKE $${params.length}`);
  }
  if (email) {
    params.push(`%${email}%`);
    conditions.push(`u.email ILIKE $${params.length}`);
  }
  if (address) {
    params.push(`%${address}%`);
    conditions.push(`u.address ILIKE $${params.length}`);
  }
  if (role) {
    params.push(role);
    conditions.push(`u.role = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             CASE WHEN u.role = 'STORE_OWNER' THEN
               (SELECT ROUND(AVG(r.rating)::numeric, 2) FROM ratings r
                  JOIN stores s ON s.id = r.store_id WHERE s.owner_id = u.id)
             ELSE NULL END AS rating
      FROM users u
      ${where}
      ORDER BY u.${col} ${dir}
    `;
    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
}

// GET /api/admin/users/:id  (detail view, includes rating if STORE_OWNER)
async function getUserDetail(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
              CASE WHEN u.role = 'STORE_OWNER' THEN
                (SELECT ROUND(AVG(r.rating)::numeric, 2) FROM ratings r
                   JOIN stores s ON s.id = r.store_id WHERE s.owner_id = u.id)
              ELSE NULL END AS rating
       FROM users u WHERE u.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
}

// POST /api/admin/stores  (create a store, optionally linked to a STORE_OWNER)
async function createStore(req, res) {
  const { name, email, address, ownerId } = req.body;

  try {
    if (ownerId) {
      const owner = await pool.query("SELECT id, role FROM users WHERE id = $1", [ownerId]);
      if (owner.rows.length === 0) {
        return res.status(400).json({ message: 'Owner user does not exist' });
      }
      if (owner.rows[0].role !== 'STORE_OWNER') {
        return res.status(400).json({ message: 'Assigned owner must have the STORE_OWNER role' });
      }
    }

    const existing = await pool.query('SELECT id FROM stores WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'A store with this email already exists' });
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at`,
      [name, email, address, ownerId || null]
    );

    res.status(201).json({ store: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create store' });
  }
}

// GET /api/admin/stores?name=&email=&address=&sortBy=&sortDir=
async function listStores(req, res) {
  const { name = '', email = '', address = '', sortBy = 'name', sortDir = 'asc' } = req.query;

  const col = ALLOWED_STORE_SORT.has(sortBy) ? sortBy : 'name';
  const dir = sortDirection(sortDir);

  const conditions = [];
  const params = [];

  if (name) {
    params.push(`%${name}%`);
    conditions.push(`s.name ILIKE $${params.length}`);
  }
  if (email) {
    params.push(`%${email}%`);
    conditions.push(`s.email ILIKE $${params.length}`);
  }
  if (address) {
    params.push(`%${address}%`);
    conditions.push(`s.address ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderCol = col === 'rating' ? 'rating' : `s.${col}`;

  try {
    const query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
             COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS rating,
             COUNT(r.id)::int AS rating_count
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

// GET /api/admin/store-owners  (helper for the "add store" form dropdown)
async function listStoreOwners(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'STORE_OWNER' ORDER BY name ASC"
    );
    res.json({ owners: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch store owners' });
  }
}

module.exports = {
  dashboard,
  createUser,
  listUsers,
  getUserDetail,
  createStore,
  listStores,
  listStoreOwners,
};
