const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const user = new User({ name, email, phone, password });
  await user.save();

  res.json({ message: 'User registered successfully' });
});

// LOGIN
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',   // ✅ ADD THIS
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});




module.exports = router;
