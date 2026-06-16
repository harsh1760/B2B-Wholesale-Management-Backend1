const Order = require("../models/Order");
const Product = require("../models/ProductSchema");
const Cart = require("../models/Cart");

/**
 * PLACE ORDER
 * POST /api/orders/placeOrder
 */
const placeOrder = async (req, res) => {
    try {

        const { userId, products, totalAmount } = req.body;

        if (!userId || !products || products.length === 0 || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: "userId, products and totalAmount are required"
            });
        }

        // Check stock availability
        for (const item of products) {

            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} has only ${product.stock} items available`
                });
            }
        }

        // Reduce stock
        for (const item of products) {

            await Product.findByIdAndUpdate(
                item.productId,
                {
                    $inc: {
                        stock: -item.quantity
                    }
                }
            );
        }

        // Create order
       // Create order
const order = await Order.create({
    userId,
    products,
    totalAmount
});

// Clear user's cart
await Cart.deleteMany({ userId });

res.status(201).json({
    success: true,
    message: "Order placed successfully, stock updated and cart cleared",
    order
});

    } catch (error) {

        console.error("❌ Place order error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * GET ALL ORDERS
 * GET /api/orders
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
 * GET ORDER BY ID
 * GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
    try {

        const order = await Order.findById(req.params.id)
            .populate("userId")
            .populate("products.productId");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * UPDATE ORDER STATUS
 * PUT /api/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
    try {

        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated",
            order
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * DELETE ORDER
 * DELETE /api/orders/:id
 */
const deleteOrder = async (req, res) => {
    try {

        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getUserOrders = async (req, res) => {
    try {

        const orders = await Order.find({
            userId: req.params.userId
        })
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

module.exports = {
    placeOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,getUserOrders
};