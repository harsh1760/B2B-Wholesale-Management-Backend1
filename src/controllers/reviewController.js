const Review = require("../models/Review");

/**
 * CREATE REVIEW
 * POST /api/reviews
 */
const createReview = async (req, res) => {
    try {

        const { userId, productId, rating, comment } = req.body;

        const review = await Review.create({
            userId,
            productId,
            rating,
            comment
        });

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * GET REVIEWS BY PRODUCT
 * GET /api/reviews/product/:productId
 */
const getReviewsByProduct = async (req, res) => {
    try {

        const reviews = await Review.find({
            productId: req.params.productId
        })
            .populate("userId", "name email")
            .populate("productId", "name");

        res.status(200).json({
            success: true,
            totalReviews: reviews.length,
            reviews
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * UPDATE REVIEW
 * PUT /api/reviews/:id
 */
const updateReview = async (req, res) => {
    try {

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * DELETE REVIEW
 * DELETE /api/reviews/:id
 */
const deleteReview = async (req, res) => {
    try {

        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    createReview,
    getReviewsByProduct,
    updateReview,
    deleteReview
};