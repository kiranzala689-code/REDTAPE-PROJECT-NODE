const express = require("express");

const {
    createPaymentOrder,
    verifyPayment,
    getMyPayments
} = require("../controller/PaymentController");

const authMiddleware = require("../middleware/authMiddleware");

const payment_router = express.Router();

payment_router.post(
    "/create",
    authMiddleware,
    createPaymentOrder
);

payment_router.post(
    "/verify",
    authMiddleware,
    verifyPayment
);

payment_router.get(
    "/my-payments",
    authMiddleware,
    getMyPayments
);

module.exports = payment_router;