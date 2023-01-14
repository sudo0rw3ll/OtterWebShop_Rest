const path = require("path");
const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const {sequelize, User} = require("./models");
require('dotenv').config();

const app = express();

var corsOptions = {
    origin: '*',
    optionSuccessStatus: 200
}

app.use(cors(corsOptions));

const countryRoutes = require("./routes/countries.js");
app.use("/admin/country", countryRoutes);

const regionRoutes = require("./routes/regions.js");
app.use("/admin/region", regionRoutes);

const cityRoutes = require("./routes/cities.js");
app.use("/admin/city", cityRoutes);

const productCategoryRoutes = require("./routes/product_categories.js");
app.use("/admin/productCategory", productCategoryRoutes);

const locationRoutes = require("./routes/locations.js");
app.use("/admin/location", locationRoutes);

const roleRoutes = require("./routes/roles.js");
app.use("/admin/role", roleRoutes);

const userRoutes = require("./routes/user.js");
app.use("/admin/user", userRoutes);

const productRoutes = require("./routes/products.js");
app.use("/admin/product", productRoutes);

const orderItemRoutes = require("./routes/orderitems.js")
app.use("/admin/orderItem", orderItemRoutes);

const orderRoutes = require("./routes/orders.js");
app.use("/admin/order", orderRoutes);

const cartItemRoutes = require("./routes/cartitems.js");
app.use("/admin/cartItem", cartItemRoutes);

const cartRoutes = require("./routes/carts.js");
app.use("/admin/cart", cartRoutes);

const transactionRoutes = require("./routes/transactions.js");
app.use("/admin/transaction", transactionRoutes);

const commentRoutes = require("./routes/comments.js")
app.use("/admin/comment", commentRoutes);

app.listen({port: 1337}, async () => {
    console.log("Started rest service on localhost:1337");
});