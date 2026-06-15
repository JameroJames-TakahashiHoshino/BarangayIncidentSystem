const express = require('express');
const { body } = require('express-validator');

const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.post(
  '/register',
  [
    body('fullName').notEmpty().withMessage('Full name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('role').optional().isIn(['resident', 'admin', 'personnel']).withMessage('Role is invalid.')
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  validateRequest,
  login
);

router.get('/me', protect, getProfile);

module.exports = router;
