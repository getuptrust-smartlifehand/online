const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
/* ======================
   REGISTER
====================== */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User exists' });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed
  });

  res.json({ message: 'Registered successfully' });
});

/* ======================
   LOGIN
====================== */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role    // ✅ VERY IMPORTANT
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
  console.log(user);
 
});

module.exports = router;
