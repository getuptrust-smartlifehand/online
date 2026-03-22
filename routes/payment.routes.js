const express = require('express');
const router = express.Router();
const razorpay = require('../config/razorpay');
/*
router.post('/create-order', async (req, res) => {
    try {
      console.log('CREATE ORDER BODY:', req.body);
      console.log('RAZORPAY INSTANCE:', razorpay);
  
      if (!razorpay) {
        return res.status(500).json({ message: 'Razorpay not configured' });
      }
  
      const { amount } = req.body;
  
      if (!amount) {
        return res.status(400).json({ message: 'Amount missing' });
      }
  
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt: 'receipt_' + Date.now()
      });
  
      res.json(order);
  
    } catch (err) {
      console.error('CREATE ORDER ERROR:', err);
      res.status(500).json({ message: err.message || 'Order creation failed' });
    }
  });*/
  
// routes/payment.routes.js
router.post('/create-order', async (req, res) => {
    const { amount } = req.body;
  
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: 'order_' + Date.now()
    });
  
    res.json(order);
  });
  
module.exports = router;
