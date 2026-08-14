const express = require('express');
const router = express.Router();

const ratingController = require('../controllers/ratingController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ratingValidator } = require('../utils/validators');

router.post(
  '/:storeId',
  authenticate,
  authorize('NORMAL'),
  [ratingValidator()],
  validate,
  ratingController.submitRating
);

router.get('/my-store', authenticate, authorize('STORE_OWNER'), ratingController.myStoreDashboard);

module.exports = router;
