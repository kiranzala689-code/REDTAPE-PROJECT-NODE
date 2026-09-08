const express = require("express");

const {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
} = require("../controller/OrderController");

const authMiddleware = require("../middleware/authMiddleware");

const order_router = express.Router();

order_router.post(
    "/",
    authMiddleware,
    createOrder
);

order_router.get(
    "/my-orders",
    authMiddleware,
    getMyOrders
);

order_router.get(
    "/:id",
    authMiddleware,
    getOrderById
);

order_router.put(
    "/:id/cancel",
    authMiddleware,
    cancelOrder
);

order_router.get(
    "/admin/all",
    authMiddleware,
    getAllOrders
);

order_router.put(
    "/admin/:id/status",
    authMiddleware,
    updateOrderStatus
);

module.exports = order_router;