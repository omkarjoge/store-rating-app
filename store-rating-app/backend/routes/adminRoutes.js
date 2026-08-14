const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  nameValidator,
  emailValidator,
  passwordValidator,
  addressValidator,
} = require('../utils/validators');

// All admin routes require an authenticated ADMIN
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.dashboard);

router.post(
  '/users',
  [nameValidator(), emailValidator(), passwordValidator(), addressValidator()],
  validate,
  adminController.createUser
);
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetail);

router.post(
  '/stores',
  [nameValidator(), emailValidator(), addressValidator()],
  validate,
  adminController.createStore
);
router.get('/stores', adminController.listStores);
router.get('/store-owners', adminController.listStoreOwners);

module.exports = router;
