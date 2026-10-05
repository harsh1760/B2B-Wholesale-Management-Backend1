const User = require("../models/User");
const Product = require("../models/ProductSchema");
const Order = require("../models/Order");

/**
 * ADMIN DASHBOARD
 */
const getDashboard = async (req, res) => {
    try {

        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const revenue = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: revenue[0]?.totalRevenue || 0
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * GET ALL USERS
 */
const getAllUsers = async (req, res) => {
    try {

        const users = await User.find().select("-password");

        res.status(200).json({
            success: true,
            totalUsers: users.length,
            users
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * GET ALL PRODUCTS
 */
const getAllProducts = async (req, res) => {
    try {

        const products = await Product.find();

        res.status(200).json({
            success: true,
            totalProducts: products.length,
            products
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * GET ALL ORDERS
 */
const getAllOrders = async (req, res) => {
    try {

        const orders = await Order.find()
            .populate("userId")
            .populate("products.productId");

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            orders
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * DELETE USER
 */
const deleteUser = async (req, res) => {
    try {

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const updateUserRole = async (req, res) => {
    try {

        const { role } = req.body;
        const allowedRoles = ["admin", "storeOwner"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Role updated successfully",
            user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getLowStockProducts = async (req, res) => {
    try {

        const products = await Product.find({
            stock: { $lte: 10 }
        });

        res.status(200).json({
            success: true,
            totalProducts: products.length,
            products
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getTopProducts = async (req, res) => {
    try {

        const products = await Order.aggregate([
            {
                $unwind: "$products"
            },
            {
                $group: {
                    _id: "$products.productId",
                    totalSold: {
                        $sum: "$products.quantity"
                    }
                }
            },
            {
                $sort: {
                    totalSold: -1
                }
            },
            {
                $limit: 5
            }
        ]);

        res.status(200).json({
            success: true,
            products
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getMonthlyRevenue = async (req, res) => {
    try {

        const revenue = await Order.aggregate([
            {
                $group: {
                    _id: {
                        month: {
                            $month: "$createdAt"
                        }
                    },
                    totalRevenue: {
                        $sum: "$totalAmount"
                    }
                }
            },
            {
                $sort: {
                    "_id.month": 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            revenue
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const deleteProductAdmin = async (req, res) => {
    try {

        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getOrderStatusAnalytics = async (req, res) => {
    try {

        const stats = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getDashboard,
    getAllUsers,
    getAllProducts,
    getAllOrders,
    deleteProductAdmin,
    deleteUser,
     updateUserRole ,
     getLowStockProducts,
     getTopProducts,
     getMonthlyRevenue,
     getOrderStatusAnalytics
};