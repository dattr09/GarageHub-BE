const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        partId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Part",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
reviewSchema.index({ partId: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
