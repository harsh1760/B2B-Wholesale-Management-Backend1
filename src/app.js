const express = require("express");
const cors = require("cors");
const authroutes=require('./routes/auth.routes');
const productRoutes = require("./routes/product.routes");
const cartRoutes=require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const reviewRoutes=require("./routes/review.routes");
const adminRoutes = require("./routes/admin.routes");
const app = express();



app.use(cors());
app.use(express.json());
app.use("/api/auth", authroutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;