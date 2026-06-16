const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    placeOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getUserOrders
} = require("../controllers/orderController");

/**
 * PLACE ORDER
 */
router.post(
    "/placeOrder",
    authMiddleware,
    placeOrder
);

/**
 * GET ALL ORDERS
 */
router.get("/", getAllOrders);

/**
 * GET USER ORDERS
 */
router.get("/user/:userId", getUserOrders);

/**
 * GET ORDER BY ID
 */
router.get("/:id", getOrderById);

/**
 * UPDATE ORDER STATUS
 */
router.put(
    "/:id/status",
    authMiddleware,
    updateOrderStatus
);

/**
 * DELETE ORDER
 */
router.delete(
    "/:id",
    authMiddleware,
    deleteOrder
);

module.exports = router;