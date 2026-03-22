const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  customerName: String,
  phone: String,
  address: String,
  note: String,

  items: [
    {
      name: String,
      price: Number,
      quantity: Number
    }
  ],

  totalAmount: Number,

  paymentId: String,
  paymentMethod: String,

  status: {
    type: String,
    enum: ['PAID','Placed', 'Delivered', 'Cancelled'],
    default: 'Placed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
