const Product = require("../models/ProductSchema");
const { uploadFile } = require("../services/ImageKit_services");

/**
 * CREATE PRODUCT
 * POST /api/products
 * Upload product with optional image to ImageKit
 */
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            price,
            stock
        } = req.body;

        // Validate required fields
        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "name, price, and category are required"
            });
        }

        // Validate price
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({
                success: false,
                message: "price must be a positive number"
            });
        }

        let imageData = {};

        // Upload image if provided
        if (req.file) {
            try {
                const uploadedImage = await uploadFile(
                    req.file.buffer,
                    `${Date.now()}-${req.file.originalname}`,
                    req.file.mimetype
                );

                imageData = {
                    url: uploadedImage.url,
                    fileId: uploadedImage.fileId
                };
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);
                return res.status(400).json({
                    success: false,
                    message: `Image upload failed: ${uploadError.message}`
                });
            }
        }

        // Create product with explicit write concern
        const product = await Product.create({
            name,
            description,
            category,
            price: parseFloat(price),
            stock: parseInt(stock) || 0,
            image: imageData
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: {
                _id: product._id,
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                stock: product.stock,
                image: product.image,
                createdAt: product.createdAt
            }
        });

    } catch (error) {
        console.error("❌ Product creation error:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message
        });
    }
};

/**
 * GET ALL PRODUCTS
 * GET /api/products?category=Grocery&sort=-price&page=1&limit=10
 * Fetch all products with filtering, sorting, and pagination
 */
const getAllProducts = async (req, res) => {
    try {
        const {
            category,
            sortBy = "-createdAt",
            page = 1,
            limit = 10,
            search
        } = req.query;

        // Build filter object
        let filter = {};

        // Filter by category if provided
        if (category) {
            filter.category = { $regex: category, $options: "i" }; // Case-insensitive
        }

        // Search by product name or description
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // Convert page and limit to numbers
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Fetch products
        const products = await Product.find(filter)
            .sort(sortBy)
            .skip(skip)
            .limit(limitNum)
            .lean();

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limitNum);

        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: {
                products,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalProducts,
                    limit: limitNum
                }
            }
        });

    } catch (error) {
        console.error("❌ Get products error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

/**
 * GET PRODUCT BY ID
 * GET /api/products/:id
 * Fetch single product by ID
 */
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            product
        });

    } catch (error) {
        console.error("❌ Get product by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
            error: error.message
        });
    }
};

/**
 * UPDATE PRODUCT
 * PUT /api/products/:id
 * Update product details (name, price, stock, etc.)
 */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            category,
            price,
            stock
        } = req.body;

        // Validate MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        // Check if product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Build update object (only include provided fields)
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (price !== undefined) {
            if (isNaN(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price must be a positive number"
                });
            }
            updateData.price = parseFloat(price);
        }
        if (stock !== undefined) {
            if (isNaN(stock) || stock < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Stock must be a non-negative number"
                });
            }
            updateData.stock = parseInt(stock);
        }

        // Handle image update if new file is provided
        if (req.file) {
            try {
                const uploadedImage = await uploadFile(
                    req.file.buffer,
                    `${Date.now()}-${req.file.originalname}`,
                    req.file.mimetype
                );

                updateData.image = {
                    url: uploadedImage.url,
                    fileId: uploadedImage.fileId
                };
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);
                return res.status(400).json({
                    success: false,
                    message: `Image upload failed: ${uploadError.message}`
                });
            }
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error("❌ Update product error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message
        });
    }
};

/**
 * DELETE PRODUCT
 * DELETE /api/products/:id
 * Delete a product by ID
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        // Find and delete product
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            product: deletedProduct
        });

    } catch (error) {
        console.error("❌ Delete product error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message
        });
    }
};



module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};