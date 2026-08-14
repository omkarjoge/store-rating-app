const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  nameValidator,
  emailValidator,
  passwordValidator,
  addressValidator,
} = require('../utils/validators');

router.post(
  '/signup',
  [nameValidator(), emailValidator(), passwordValidator(), addressValidator()],
  validate,
  authController.signup
);

router.post(
  '/login',
  [emailValidator(), require('express-validator').body('password').notEmpty().withMessage('Password is required')],
  validate,
  authController.login
);

router.put(
  '/password',
  authenticate,
  [
    require('express-validator').body('currentPassword').notEmpty().withMessage('Current password is required'),
    passwordValidator('newPassword'),
  ],
  validate,
  authController.updatePassword
);

router.get('/me', authenticate, authController.me);

module.exports = router;
