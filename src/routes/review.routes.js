const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createReview,
    getReviewsByProduct,
    updateReview,
    deleteReview
} = require("../controllers/reviewController");

/**
 * CREATE REVIEW
 */
router.post(
    "/",
    authMiddleware,
    createReview
);

/**
 * GET REVIEWS BY PRODUCT
 */
router.get(
    "/product/:productId",
    getReviewsByProduct
);

/**
 * UPDATE REVIEW
 */
router.put(
    "/:id",
    authMiddleware,
    updateReview
);

/**
 * DELETE REVIEW
 */
router.delete(
    "/:id",
    authMiddleware,
    deleteReview
);

module.exports = router;