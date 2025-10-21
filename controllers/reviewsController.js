const Review = require('../models/reviewModel');

class ReviewsController {
  // [GET] /api/reviews
  async getAll(req, res) {
    try {
      const reviews = await Review.find()
        .populate('userId', 'fullName email')
        .populate('orderId', 'orderId totalAmount')
        .sort({ createdAt: -1 });
      
      return res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // [GET] /api/reviews/approved - Lấy reviews đã duyệt
  async getApproved(req, res) {
    try {
      const reviews = await Review.find({ isApproved: true })
        .populate('userId', 'fullName email')
        .populate('orderId', 'orderId totalAmount')
        .sort({ createdAt: -1 });
      
      return res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching approved reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // [GET] /api/reviews/user/:userId
  async getByUser(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const reviews = await Review.find({ userId })
        .populate('orderId', 'orderId totalAmount')
        .sort({ createdAt: -1 });
      
      return res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching reviews by user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // [GET] /api/reviews/stats - Thống kê rating
  async getStats(req, res) {
    try {
      const stats = await Review.aggregate([
        { $match: { isApproved: true } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
          }
        }
      ]);
      
      if (stats.length === 0) {
        return res.status(200).json({
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      }
      
      const result = stats[0];
      return res.status(200).json({
        totalReviews: result.totalReviews,
        averageRating: Math.round(result.averageRating * 10) / 10,
        ratingDistribution: {
          5: result.rating5,
          4: result.rating4,
          3: result.rating3,
          2: result.rating2,
          1: result.rating1
        }
      });
    } catch (error) {
      console.error('Error fetching review stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // [GET] /api/reviews/:reviewId
  async getById(req, res) {
    try {
      const { reviewId } = req.params;
      
      const review = await Review.findById(reviewId)
        .populate('userId', 'fullName email')
        .populate('orderId', 'orderId totalAmount');
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      return res.status(200).json(review);
    } catch (error) {
      console.error('Error fetching review by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // [POST] /api/reviews - Tạo hoặc cập nhật review
  async createOrUpdate(req, res) {
    try {
      const { userId, email, rating, comment, orderId } = req.body;
      
      // Validate
      if (!userId || !email) {
        return res.status(400).json({ error: 'Thiếu thông tin user.' });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating phải từ 1 đến 5.' });
      }

      if (!comment || comment.trim() === '') {
        return res.status(400).json({ error: 'Comment không được để trống.' });
      }

      // Kiểm tra xem user đã review order này chưa
      if (orderId) {
        const existingReview = await Review.findOne({ userId, orderId });
        
        if (existingReview) {
          // Cập nhật review hiện có
          existingReview.rating = rating;
          existingReview.comment = comment;
          existingReview.email = email;
          existingReview.isApproved = false; // Reset approval khi cập nhật
          
          await existingReview.save();
          
          return res.status(200).json({ 
            message: 'Đánh giá đã được cập nhật.',
            review: existingReview
          });
        }
      }

      // Tạo review mới
      const review = new Review({
        userId,
        email,
        rating,
        comment,
        orderId: orderId || null
      });

      const savedReview = await review.save();
      
      return res.status(201).json({ 
        message: 'Đánh giá đã được lưu.',
        review: savedReview
      });
    } catch (error) {
      console.error('Error creating/updating review:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // [PUT] /api/reviews/:reviewId/approve - Duyệt review (Admin)
  async approve(req, res) {
    try {
      const { reviewId } = req.params;
      
      const review = await Review.findByIdAndUpdate(
        reviewId,
        { isApproved: true },
        { new: true }
      );
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      return res.status(200).json({ 
        message: 'Review đã được duyệt.',
        review
      });
    } catch (error) {
      console.error('Error approving review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // [PUT] /api/reviews/:reviewId
  async update(req, res) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      
      const updateData = {};
      if (rating) updateData.rating = rating;
      if (comment) updateData.comment = comment;
      updateData.isApproved = false; // Reset approval khi cập nhật
      
      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!updatedReview) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      return res.status(200).json({
        message: 'Review đã được cập nhật.',
        review: updatedReview
      });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // [DELETE] /api/reviews/:reviewId
  async delete(req, res) {
    try {
      const { reviewId } = req.params;
      
      const deletedReview = await Review.findByIdAndDelete(reviewId);
      
      if (!deletedReview) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      return res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ReviewsController();