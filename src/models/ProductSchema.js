const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [3, "Product name must be at least 3 characters"]
        },

        description: {
            type: String,
            trim: true
        },

        category: {
            type: String,
            required: [true, "Category is required"]
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"]
        },

        stock: {
            type: Number,
            default: 0,
            min: [0, "Stock cannot be negative"]
        },

        image: {
            url: {
                type: String
            },
            fileId: {
                type: String
            }
        }
    },
    {
        timestamps: true,
        writeConcern: { w: 1 }
    }
);

module.exports = mongoose.model("Product", productSchema);