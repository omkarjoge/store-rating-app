const pool = require('../config/db');

// POST /api/ratings/:storeId  (NORMAL user submits or updates a rating)
async function submitRating(req, res) {
  const { storeId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  try {
    const store = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (store.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Upsert: one rating per (user, store)
    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = EXCLUDED.rating, updated_at = now()
       RETURNING id, user_id, store_id, rating, created_at, updated_at`,
      [userId, storeId, rating]
    );

    res.status(200).json({ rating: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
}

// GET /api/ratings/my-store  (STORE_OWNER dashboard)
async function myStoreDashboard(req, res) {
  const ownerId = req.user.id;

  try {
    const storeResult = await pool.query('SELECT id, name, email, address FROM stores WHERE owner_id = $1', [
      ownerId,
    ]);

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ message: 'No store is currently linked to this account' });
    }

    const store = storeResult.rows[0];

    const avgResult = await pool.query(
      `SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS average_rating, COUNT(*)::int AS rating_count
       FROM ratings WHERE store_id = $1`,
      [store.id]
    );

    const ratersResult = await pool.query(
      `SELECT u.id, u.name, u.email, r.rating, r.created_at, r.updated_at
       FROM ratings r JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    res.json({
      store,
      averageRating: avgResult.rows[0].average_rating,
      ratingCount: avgResult.rows[0].rating_count,
      raters: ratersResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load store dashboard' });
  }
}

module.exports = { submitRating, myStoreDashboard };
