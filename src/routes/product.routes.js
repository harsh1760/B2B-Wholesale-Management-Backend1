// const express = require("express");
// const router = express.Router();

// const upload = require("../middleware/upload");
// const {
//     createProduct,
//     getAllProducts,
//     getProductById,
//     updateProduct,
//     deleteProduct
// } = require("../controllers/productController");
const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

// ================================
// PRODUCT CRUD ROUTES
// ================================

/**
 * POST /api/products
 * Create a new product with optional image upload
 * Body: { name, description, category, price, stock }
 * File: image (optional)
 */
router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    createProduct
);

/**
 * GET /api/products
 * Get all products with filtering, sorting, and pagination
 * Query params:
 *   - category: Filter by category
 *   - search: Search by name or description
 *   - sortBy: Sort field (default: -createdAt)
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10)
 */
router.get("/", getAllProducts);

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get("/:id", getProductById);

/**
 * PUT /api/products/:id
 * Update a product by ID
 * Body: { name, description, category, price, stock }
 * File: image (optional - to update image)
 */
router.put(
    "/:id",
    authMiddleware,
    upload.single("image"),
    updateProduct
);

/**
 * DELETE /api/products/:id
 * Delete a product by ID
 */
router.delete(
    "/:id",
    authMiddleware,
    deleteProduct
);

module.exports = router;