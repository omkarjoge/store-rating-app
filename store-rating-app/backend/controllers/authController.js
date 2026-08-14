const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { signToken } = require('../utils/jwt');

// POST /api/auth/signup  (Normal users only — self registration)
async function signup(req, res) {
  const { name, email, password, address } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, 'NORMAL')
       RETURNING id, name, email, address, role, created_at`,
      [name, email, passwordHash, address]
    );

    const user = result.rows[0];
    const token = signToken({ id: user.id, role: user.role, email: user.email, name: user.name });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to sign up' });
  }
}

// POST /api/auth/login  (all roles)
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, address, role FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({ id: user.id, role: user.role, email: user.email, name: user.name });
    delete user.password_hash;

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to log in' });
  }
}

// PUT /api/auth/password  (any authenticated user updates their own password)
async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update password' });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
}

module.exports = { signup, login, updatePassword, me };
