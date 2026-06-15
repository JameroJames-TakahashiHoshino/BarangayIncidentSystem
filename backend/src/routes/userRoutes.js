const express = require('express');
const { body, param } = require('express-validator');

const { getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/', protect, authorizeRoles('admin'), getAllUsers);

router.patch(
	'/:id',
	protect,
	authorizeRoles('admin'),
	[
		param('id').isMongoId().withMessage('Valid user id is required.'),
		body('fullName').optional().isString().withMessage('fullName must be a string.'),
		body('email').optional().isEmail().withMessage('Valid email is required.'),
		body('role').optional().isIn(['resident', 'admin', 'personnel']).withMessage('Role is invalid.'),
		body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
		body('isActive').optional().isBoolean().withMessage('isActive must be a boolean.')
	],
	validateRequest,
	updateUser
);

router.delete('/:id', protect, authorizeRoles('admin'), [param('id').isMongoId()], validateRequest, deleteUser);

module.exports = router;
