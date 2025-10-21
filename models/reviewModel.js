const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5
    },
    comment: { 
      type: String,
      required: true,
      trim: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh
reviewSchema.index({ userId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ isApproved: 1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
