const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

/* ==========================
   PLACE ORDER (JWT USER)
   ========================== */
   router.post('/', auth, async (req, res) => {
    try {
      const userId = req.user.id;
  
      const cartItems = await Cart.find({ userId });
      if (!cartItems.length) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
  
      const items = cartItems.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }));
  
      const totalAmount = items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
  
      const customer = req.body.customer || {};
  
      const order = await Order.create({
        userId,
        items,
        totalAmount,
  
        customerName: customer.customerName,
        phone: customer.phone,
        address: customer.address,
        note: customer.note,
  
        paymentId: customer.paymentId,
        status: customer.status || 'Placed'
      });
  
      await Cart.deleteMany({ userId });
  
      res.json(order);
  
    } catch (err) {
      console.error('❌ PLACE ORDER ERROR:', err);
      res.status(500).json({ message: err.message });
    }
  });
  
  
  
/* ==========================
   GET MY ORDERS (JWT USER)
   ========================== */
   router.get('/', auth, async (req, res) => {
    try {
      const orders = await Order.find({ userId: req.user.id })
        .populate('userId', 'name email')   // ✅ HERE
        .sort({ createdAt: -1 });
  
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  
// ❌ CANCEL ORDER (USER)
router.put('/cancel/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({
        message: 'Delivered orders cannot be cancelled'
      });
    }

    order.status = 'Cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
const admin = require('../middleware/admin.middleware');

/* ADMIN: GET ALL ORDERS */
router.get('/admin/all', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')   // 🔥 THIS LINE FIXES IT
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



/* ADMIN: UPDATE ORDER STATUS */
router.put('/admin/status/:id', auth, admin, async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;
  await order.save();

  res.json({ message: 'Order status updated' });
});
/* =========================
   ADMIN DASHBOARD STATS
   ========================= */
   router.get('/admin/dashboard', auth, admin, async (req, res) => {
    try {
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({ status: { $in: ['Placed', 'Pending'] } });
      const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
      const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
  
      const revenueAgg = await Order.aggregate([
        { $match: { status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
  
      res.json({
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        revenue: revenueAgg[0]?.total || 0
      });
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
module.exports = router;
