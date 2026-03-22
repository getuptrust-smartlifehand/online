const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/cart.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

/* ==========================
   ADD TO CART (JWT USER)
   ========================== */
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;          // ✅ FROM JWT
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    let item = await Cart.findOne({ userId: userObjectId, name });

    if (item) {
      item.quantity += 1;
      await item.save();
    } else {
      item = await Cart.create({
        userId: userObjectId,
        name,
        price,
        quantity: 1
      });
    }

    res.json(item);

  } catch (err) {
    console.error('❌ ADD TO CART FAILED:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/* ==========================
   GET MY CART (JWT USER)
   ========================== */
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;
  const items = await Cart.find({ userId });
  res.json(items);

});
// PUT /api/cart/:itemId
// PUT /api/cart/:itemId  → update quantity
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const item = await Cart.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // ✅ ensure ownership
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    item.quantity = quantity;
    await item.save();

    res.json(item);

  } catch (err) {
    console.error('❌ UPDATE CART FAILED:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


/* ==========================
   REMOVE / DECREASE ITEM
   ========================== */
router.delete('/item/:id', auth, async (req, res) => {
  const item = await Cart.findById(req.params.id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  // Ensure user owns the item
  if (item.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (item.quantity > 1) {
    item.quantity -= 1;
    await item.save();
  } else {
    await Cart.findByIdAndDelete(req.params.id);
  }

  res.json({ message: 'Cart updated' });
});

/* ==========================
   CLEAR MY CART
   ========================== */
router.delete('/', auth, async (req, res) => {
  await Cart.deleteMany({ userId: req.user.id });
  res.json({ message: 'Cart cleared' });
});

/* ==========================
   DEBUG
   ========================== */
router.get('/test', (req, res) => {
  res.send('CART ROUTES WORKING');
});

console.log('🔥 cart.routes.js LOADED');
module.exports = router;
