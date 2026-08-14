/**
 * Initializes the database: runs schema.sql, then ensures a default
 * System Administrator account exists (from .env values).
 *
 * Usage: npm run db:init
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function main() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Running schema.sql ...');
  await pool.query(schemaSql);
  console.log('Schema applied.');

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ADDRESS } = process.env;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);
  if (existing.rows.length > 0) {
    console.log('Default admin already exists, skipping seed.');
  } else {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, 'ADMIN')`,
      [ADMIN_NAME, ADMIN_EMAIL, hash, ADMIN_ADDRESS]
    );
    console.log(`Default admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  await pool.end();
  console.log('Done.');
}

main().catch((err) => {
  console.error('DB init failed:', err);
  process.exit(1);
});
