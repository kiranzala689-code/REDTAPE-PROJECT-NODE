const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const router = require("./router/UserRouter");
const pro_router = require("./router/ProductRouter");
const cart_router = require("./router/cartRoutes");
const address_router = require("./router/addressRoutes");
const order_router = require("./router/orderRoutes");
const payment_router = require("./router/paymentRoutes");
const review_router = require("./router/reviewRoutes");
const otp_router = require("./router/OtpRouter");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

console.log("JWT SECRET LOADED:", !!process.env.JWT_SECRET);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "E-commerce API is running"
    });
});

app.use("/api/products", pro_router);
app.use("/api/auth", router);
app.use("/api/cart", cart_router);
app.use("/api/address", address_router);
app.use("/api/orders", order_router);
app.use("/api/payment", payment_router);
app.use("/api/reviews", review_router);
app.use("/api/otp", otp_router);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;