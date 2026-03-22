const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    image: String,
    category: String,
  
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        value: { type: Number, min: 1, max: 5 },
        review: String
      }
    ],
  
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  }, { timestamps: true });
  

module.exports = mongoose.model('Product', ProductSchema);
