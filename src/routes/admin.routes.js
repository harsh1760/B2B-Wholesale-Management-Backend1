const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getDashboard,
    getAllUsers,
    getAllProducts,
    getAllOrders,
    updateUserRole,
     getLowStockProducts,
     getTopProducts,
     getMonthlyRevenue,
    deleteUser,
    deleteProductAdmin,
    getOrderStatusAnalytics
} = require("../controllers/adminController");

router.get(
    "/dashboard",
    authMiddleware,
    adminMiddleware,
    getDashboard
);

router.get(
    "/users",
    authMiddleware,
    adminMiddleware,
    getAllUsers
);

router.get(
    "/products",
    authMiddleware,
    adminMiddleware,
    getAllProducts
);

router.get(
    "/orders",
    authMiddleware,
    adminMiddleware,
    getAllOrders
);
router.put(
    "/users/:id/role",
    authMiddleware,
    adminMiddleware,
    updateUserRole
);

router.get(
    "/low-stock",
    authMiddleware,
    adminMiddleware,
    getLowStockProducts
);
router.get(
    "/top-products",
    authMiddleware,
    adminMiddleware,
    getTopProducts
);
router.get(
    "/monthly-revenue",
    authMiddleware,
    adminMiddleware,
    getMonthlyRevenue
);

router.delete(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    deleteUser
);

router.delete(
    "/products/:id",
    authMiddleware,
    adminMiddleware,
    deleteProductAdmin
);
router.get(
    "/order-status",
    authMiddleware,
    adminMiddleware,
    getOrderStatusAnalytics
);
module.exports = router;