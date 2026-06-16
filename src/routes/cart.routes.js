const express = require("express");
const cartControllers = require("../controllers/CartController");

const router = express.Router();

// POST /api/cart/addToCart - Add product to cart
router.post("/addToCart", cartControllers.addToCart);

// GET /api/cart/:userId - Get cart items for user
router.get("/:userId", cartControllers.getCart);

// DELETE /api/cart/:id - Remove item from cart
router.delete("/:id", cartControllers.removeFromCart);

// PUT /api/cart/:id - Update cart item quantity
router.put("/:id", cartControllers.updateCart);

module.exports = router;

    