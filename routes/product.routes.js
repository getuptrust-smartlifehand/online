const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// ADD PRODUCT (ADMIN only – later)
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create product' });
  }
});

module.exports = router;
