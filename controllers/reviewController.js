const Review = require("../models/reviewModel");
const Part = require("../models/partModel");

// Get reviews by part ID
const getReviewsByPart = async (req, res) => {
    try {
        const { partId } = req.params;

        // Check if part exists
        const part = await Part.findById(partId);
        if (!part) {
            return res.status(404).json({ success: false, message: "Part not found" });
        }

        // Get reviews sorted by newest first
        const reviews = await Review.find({ partId }).sort({ createdAt: -1 });

        // Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
        }

        res.status(200).json({
            success: true,
            reviewCount: reviews.length,
            averageRating,
            reviews,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new review
const createReview = async (req, res) => {
    try {
        const { partId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.userId;
        const userName = req.user.name || req.user.email || "Ẩn danh";

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Comment is required" });
        }

        // Check if part exists
        const part = await Part.findById(partId);
        if (!part) {
            return res.status(404).json({ success: false, message: "Part not found" });
        }

        // Check if user already reviewed this part
        const existingReview = await Review.findOne({ partId, userId });
        if (existingReview) {
            // Update existing review
            existingReview.rating = rating;
            existingReview.comment = comment.trim();
            await existingReview.save();

            return res.status(200).json({
                success: true,
                message: "Review updated successfully",
                review: existingReview,
            });
        }

        // Create new review
        const review = new Review({
            partId,
            userId,
            userName,
            rating,
            comment: comment.trim(),
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            review,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a review (only owner or admin)
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.roles;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Check permission
        if (review.userId.toString() !== userId && userRole !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        await Review.findByIdAndDelete(reviewId);

        res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getReviewsByPart,
    createReview,
    deleteReview,
};
