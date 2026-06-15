const bcrypt = require('bcryptjs');
const User = require('../models/User');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Users fetched successfully.',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, password, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email is already in use.' });
      }
      user.email = email;
    }

    if (fullName) {
      user.fullName = fullName;
    }

    if (role) {
      user.role = role;
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const saved = await user.save();

    res.status(200).json({
      message: 'User updated successfully.',
      data: {
        _id: saved._id,
        fullName: saved.fullName,
        email: saved.email,
        role: saved.role,
        isActive: saved.isActive,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUser, deleteUser };
