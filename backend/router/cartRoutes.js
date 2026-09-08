const express = require("express");

const {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    mergeGuestCart
} = require("../controller/CartController");

const authMiddleware =
    require("../middleware/authMiddleware");

const cart_router =
    express.Router();

cart_router.post(
    "/",
    addToCart
);

cart_router.get(
    "/",
    getCart
);

cart_router.put(
    "/:itemId",
    updateCartQuantity
);

cart_router.delete(
    "/:itemId",
    removeFromCart
);

cart_router.delete(
    "/clear",
    clearCart
);

cart_router.post(
    "/merge",
    authMiddleware,
    mergeGuestCart
);

module.exports = cart_router;