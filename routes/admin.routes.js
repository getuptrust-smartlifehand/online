const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');
const Order = require('../models/order.model');

// GET DASHBOARD DATA (ADMIN ONLY)
router.get('/dashboard', auth, admin, async (req, res) => {
  res.json({
    totalOrders: 10,
    pendingOrders: 2,
    deliveredOrders: 6,
    cancelledOrders: 2,
    revenue: 12000,
  });
});

// GET ALL ORDERS (ADMIN ONLY)
router.get('/orders', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({ path: 'userId', select: 'name email' })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load orders' });
  }
});

// UPDATE ORDER STATUS (ADMIN ONLY)
router.put(
  '/orders/:id/status',
  auth,
  admin,
  [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status')
      .isIn(['Pending', 'Delivered', 'Cancelled'])
      .withMessage('Invalid status'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update status' });
    }
  }
);

module.exports = router;