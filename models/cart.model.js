const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cart = require('../models/cart.model');

router.post('/', async (req, res) => {
  const { userId, name, price } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'UserId required' });
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  let item = await Cart.findOne({ userId: userObjectId, name });

  if (item) {
    item.quantity += 1;
    await item.save();
  } else {
    item = new Cart({
      userId: userObjectId,
      name,
      price,
      quantity: 1
    });
    await item.save();
  }

  res.json(item);
});

router.get('/:userId', async (req, res) => {
  const items = await Cart.find({
    userId: new mongoose.Types.ObjectId(req.params.userId)
  });
  res.json(items);
});

router.delete('/item/:id', async (req, res) => {
  const item = await Cart.findById(req.params.id);

  if (!item) return res.status(404).json({ message: 'Item not found' });

  if (item.quantity > 1) {
    item.quantity -= 1;
    await item.save();
  } else {
    await Cart.findByIdAndDelete(req.params.id);
  }

  res.json({ message: 'Updated' });
});

router.delete('/user/:userId', async (req, res) => {
  await Cart.deleteMany({
    userId: new mongoose.Types.ObjectId(req.params.userId)
  });
  res.json({ message: 'Cart cleared' });
});
const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});
module.exports = router;
module.exports = mongoose.model('Cart', CartSchema);

