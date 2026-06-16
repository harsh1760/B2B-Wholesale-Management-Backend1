const Cart = require("../models/Cart");
const Product = require("../models/ProductSchema");

/**
 * ADD PRODUCT TO CART
 * POST /api/cart/addToCart
 */const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "userId, productId and quantity are required"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const existingItem = await Cart.findOne({
            userId,
            productId
        });

        if (existingItem) {
            existingItem.quantity += quantity;

            await existingItem.save();

            const updatedCart = await Cart.findById(existingItem._id)
                .populate("userId")
                .populate("productId");

            return res.status(200).json({
                success: true,
                message: "Cart item quantity updated",
                cartItem: updatedCart
            });
        }

        const cartItem = await Cart.create({
            userId,
            productId,
            quantity
        });

        const populatedCart = await Cart.findById(cartItem._id)
            .populate("userId")
            .populate("productId");

        res.status(201).json({
            success: true,
            message: "Product added to cart",
            cartItem: populatedCart
        });

    } catch (error) {

        console.error("❌ Add to cart error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add product to cart",
            error: error.message
        });
    }
};
/**
 * GET CART ITEMS FOR USER
 * GET /api/cart/:userId
 */
const getCart = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }

        // Get cart items for specific user
        const cartItems = await Cart.find({ userId })
            .populate({
                path: "productId",
                select: "name price stock image category"
            })
            .populate({
                path: "userId",
                select: "name email"
            });

        // Calculate total price
        let totalPrice = 0;
        const itemsWithTotal = cartItems.map(item => {
            const itemTotal = item.productId.price * item.quantity;
            totalPrice += itemTotal;
            return {
                ...item.toObject(),
                itemTotal
            };
        });

        res.status(200).json({
            success: true,
            message: "Cart items fetched successfully",
            data: {
                items: itemsWithTotal,
                totalItems: cartItems.length,
                totalPrice: totalPrice.toFixed(2)
            }
        });

    } catch (error) {
        console.error("❌ Get cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cart items",
            error: error.message
        });
    }
};

/**
 * UPDATE CART ITEM QUANTITY
 * PUT /api/cart/:id
 */
const updateCart = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        // Validate quantity
        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        // Update cart item
        const cartItem = await Cart.findByIdAndUpdate(
            id,
            { quantity },
            { new: true }
        ).populate("productId");

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            cartItem
        });

    } catch (error) {
        console.error("❌ Update cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update cart item",
            error: error.message
        });
    }
};

/**
 * REMOVE ITEM FROM CART
 * DELETE /api/cart/:id
 */
const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid cart item ID format"
            });
        }

        // Find and delete cart item
        const cartItem = await Cart.findByIdAndDelete(id);

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            cartItem
        });

    } catch (error) {
        console.error("❌ Remove from cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove item from cart",
            error: error.message
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCart,
    removeFromCart
};