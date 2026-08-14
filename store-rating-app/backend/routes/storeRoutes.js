const express = require('express');
const router = express.Router();

const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');

// Any authenticated user may browse stores (NORMAL primarily, but admins/
// store owners are not blocked from viewing the same listing).
router.get('/', authenticate, authorize('NORMAL', 'ADMIN', 'STORE_OWNER'), storeController.listStores);

module.exports = router;
