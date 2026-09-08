const ProductModel = require("../model/ProductModel");

const categoryMap = {
    footwear: "Footwear",
    shoes: "Footwear",
    pent: "Pants",
    pents: "Pants",
    pants: "Pants",
    shirt: "Shirts",
    shirts: "Shirts",
    womens: "Womens",
    accessories: "Accessories",
    "new-arrival": "New Arrival"
};

const getActualCategory = (category) => {
    const key = String(category || "")
        .trim()
        .toLowerCase();

    return categoryMap[key] || category;
};

const getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.find();

        res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        console.log(
            "GET ALL PRODUCTS ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Products not found",
            error: error.message
        });
    }
};

const getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category;

        const actualCategory =
            getActualCategory(category);

        console.log(
            "CATEGORY:",
            category
        );

        console.log(
            "ACTUAL CATEGORY:",
            actualCategory
        );

        const products =
            await ProductModel.find({
                category: {
                    $regex: `^${actualCategory}$`,
                    $options: "i"
                }
            });

        console.log(
            "CATEGORY PRODUCTS:",
            products.length
        );

        res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        console.log(
            "CATEGORY PRODUCTS ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Category products not found",
            error: error.message
        });
    }
};

const getSingleProduct = async (req, res) => {
    try {
        const product =
            await ProductModel.findById(
                req.params.id
            );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.log(
            "SINGLE PRODUCT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Product not found",
            error: error.message
        });
    }
};

const searchProducts = async (req, res) => {
    try {
        const search =
            req.query.search?.trim() || "";

        if (!search) {
            return res.status(200).json({
                success: true,
                products: []
            });
        }

        const products =
            await ProductModel.find({
                $or: [
                    {
                        name: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        category: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        subCategory: {
                            $regex: search,
                            $options: "i"
                        }
                    },
                    {
                        brand: {
                            $regex: search,
                            $options: "i"
                        }
                    }
                ]
            });

        res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        console.log(
            "SEARCH PRODUCTS ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Search failed",
            error: error.message
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const product =
            await ProductModel.create(
                req.body
            );

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {
        console.log(
            "CREATE PRODUCT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Product create failed",
            error: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product =
            await ProductModel.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        console.log(
            "UPDATE PRODUCT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Product update failed",
            error: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product =
            await ProductModel.findByIdAndDelete(
                req.params.id
            );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.log(
            "DELETE PRODUCT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Product delete failed",
            error: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProductsByCategory,
    getSingleProduct,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct
};