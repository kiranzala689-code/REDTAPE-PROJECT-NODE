const express = require("express");

const {
    getAllProducts,
    getProductsByCategory,
    getSingleProduct,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controller/ProductController");

const pro_router = express.Router();

pro_router.get(
    "/search",
    searchProducts
);

pro_router.get(
    "/",
    getAllProducts
);

pro_router.post(
    "/",
    createProduct
);

pro_router.get(
    "/single/:id",
    getSingleProduct
);

pro_router.get(
    "/:category/:id",
    getSingleProduct
);

pro_router.put(
    "/:id",
    updateProduct
);

pro_router.delete(
    "/:id",
    deleteProduct
);

pro_router.get(
    "/:category",
    getProductsByCategory
);

module.exports = pro_router;