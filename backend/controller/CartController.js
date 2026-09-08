const CartModel = require("../model/CartModel");
const ProductModel = require("../model/ProductModel");

const getOwner = (req) => {
    const userId =
        req.user?.id ||
        req.user?._id ||
        req.body?.userId ||
        req.query?.userId ||
        null;

    const guestId =
        req.body?.guestId ||
        req.query?.guestId ||
        null;

    return {
        userId,
        guestId
    };
};

const addToCart = async (req, res) => {
    try {
        const {
            product,
            quantity,
            size,
            color,
            userId,
            guestId
        } = req.body;

        console.log("ADD TO CART BODY:", req.body);
        console.log("REQ USER:", req.user);

        if (!product || !quantity) {
            return res.status(400).json({
                message: "Product and quantity are required"
            });
        }

        const ownerUserId =
            req.user?.id ||
            req.user?._id ||
            userId ||
            null;

        const ownerGuestId =
            guestId || null;

        console.log("ADD CART OWNER:", {
            userId: ownerUserId,
            guestId: ownerGuestId
        });

        if (!ownerUserId && !ownerGuestId) {
            return res.status(400).json({
                message: "User or guestId is required"
            });
        }

        const productData =
            await ProductModel.findById(product);

        if (!productData) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const qty = Number(quantity);

        if (qty < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
            });
        }

        if (
            Number(productData.stock || 0) < qty
        ) {
            return res.status(400).json({
                message: "Not enough stock"
            });
        }

        const selectedSize =
            String(size || "");

        const selectedColor =
            String(color || "");

        if (
            productData.sizes?.length > 0 &&
            !productData.sizes.some(
                item =>
                    String(item) === selectedSize
            )
        ) {
            return res.status(400).json({
                message:
                    "Selected size is not available"
            });
        }

        if (
            productData.colors?.length > 0 &&
            !productData.colors.includes(
                selectedColor
            )
        ) {
            return res.status(400).json({
                message:
                    "Selected color is not available"
            });
        }

        let cart;

        if (ownerUserId) {
            cart =
                await CartModel.findOne({
                    user: ownerUserId
                });
        } else {
            cart =
                await CartModel.findOne({
                    guestId: ownerGuestId
                });
        }

        if (!cart) {
            cart =
                new CartModel({
                    user:
                        ownerUserId || null,

                    guestId:
                        ownerUserId
                            ? null
                            : ownerGuestId,

                    items: [
                        {
                            product,
                            quantity: qty,
                            size: selectedSize,
                            color: selectedColor
                        }
                    ]
                });
        } else {

            const existingItem =
                cart.items.find(
                    item =>
                        item.product.toString() ===
                            product &&
                        String(
                            item.size || ""
                        ) === selectedSize &&
                        String(
                            item.color || ""
                        ) === selectedColor
                );

            if (existingItem) {

                const newQuantity =
                    Number(
                        existingItem.quantity
                    ) + qty;

                if (
                    Number(
                        productData.stock || 0
                    ) < newQuantity
                ) {
                    return res.status(400).json({
                        message:
                            "Not enough stock"
                    });
                }

                existingItem.quantity =
                    newQuantity;

            } else {

                cart.items.push({
                    product,
                    quantity: qty,
                    size: selectedSize,
                    color: selectedColor
                });
            }
        }

        await cart.save();

        const updatedCart =
            await CartModel.findById(
                cart._id
            ).populate(
                "items.product"
            );

        console.log("CART SAVED:", {
            cartId: updatedCart._id,
            user: updatedCart.user,
            guestId: updatedCart.guestId
        });

        return res.status(200).json({
            message: "Product added to cart",
            cart: updatedCart
        });

    } catch (error) {

        console.log(
            "ADD CART ERROR:",
            error
        );

        return res.status(500).json({
            message: error.message
        });
    }
};

const getCart = async (req, res) => {
    try {

        const {
            userId,
            guestId
        } = getOwner(req);

        console.log(
            "GET CART OWNER:",
            {
                userId,
                guestId
            }
        );

        let cart = null;

        if (userId) {

            cart =
                await CartModel.findOne({
                    user: userId
                }).populate(
                    "items.product"
                );

        } else if (guestId) {

            cart =
                await CartModel.findOne({
                    guestId
                }).populate(
                    "items.product"
                );
        }

        if (!cart) {
            return res.status(200).json({
                message: "Cart is empty",
                cart: {
                    items: []
                }
            });
        }

        return res.status(200).json({
            message:
                "Cart fetched successfully",
            cart
        });

    } catch (error) {

        console.log(
            "GET CART ERROR:",
            error
        );

        return res.status(500).json({
            message: error.message
        });
    }
};

const updateCartQuantity = async (
    req,
    res
) => {
    try {

        const qty =
            Number(req.body.quantity);

        if (!qty || qty < 1) {
            return res.status(400).json({
                message:
                    "Quantity must be at least 1"
            });
        }

        const {
            userId,
            guestId
        } = getOwner(req);

        let cart = null;

        if (userId) {

            cart =
                await CartModel.findOne({
                    user: userId
                });

        } else if (guestId) {

            cart =
                await CartModel.findOne({
                    guestId
                });
        }

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const item =
            cart.items.id(
                req.params.itemId
            );

        if (!item) {
            return res.status(404).json({
                message:
                    "Cart item not found"
            });
        }

        const product =
            await ProductModel.findById(
                item.product
            );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (
            Number(product.stock || 0) < qty
        ) {
            return res.status(400).json({
                message:
                    "Not enough stock"
            });
        }

        item.quantity = qty;

        await cart.save();

        const updatedCart =
            await CartModel.findById(
                cart._id
            ).populate(
                "items.product"
            );

        return res.status(200).json({
            message:
                "Cart quantity updated",
            cart: updatedCart
        });

    } catch (error) {

        console.log(
            "UPDATE CART ERROR:",
            error
        );

        return res.status(500).json({
            message: error.message
        });
    }
};

const removeFromCart = async (
    req,
    res
) => {
    try {

        const {
            userId,
            guestId
        } = getOwner(req);

        let cart = null;

        if (userId) {

            cart =
                await CartModel.findOne({
                    user: userId
                });

        } else if (guestId) {

            cart =
                await CartModel.findOne({
                    guestId
                });
        }

        if (!cart) {
            return res.status(404).json({
                message:
                    "Cart not found"
            });
        }

        const item =
            cart.items.id(
                req.params.itemId
            );

        if (!item) {
            return res.status(404).json({
                message:
                    "Cart item not found"
            });
        }

        cart.items.pull(
            req.params.itemId
        );

        await cart.save();

        const updatedCart =
            await CartModel.findById(
                cart._id
            ).populate(
                "items.product"
            );

        return res.status(200).json({
            message:
                "Product removed from cart",
            cart: updatedCart
        });

    } catch (error) {

        console.log(
            "REMOVE CART ERROR:",
            error
        );

        return res.status(500).json({
            message: error.message
        });
    }
};

const clearCart = async (
    req,
    res
) => {
    try {

        const {
            userId,
            guestId
        } = getOwner(req);

        let cart = null;

        if (userId) {

            cart =
                await CartModel.findOne({
                    user: userId
                });

        } else if (guestId) {

            cart =
                await CartModel.findOne({
                    guestId
                });
        }

        if (!cart) {
            return res.status(404).json({
                message:
                    "Cart not found"
            });
        }

        cart.items = [];

        await cart.save();

        return res.status(200).json({
            message:
                "Cart cleared successfully",
            cart
        });

    } catch (error) {

        console.log(
            "CLEAR CART ERROR:",
            error
        );

        return res.status(500).json({
            message: error.message
        });
    }
};

const mergeGuestCart = async (
    req,
    res
) => {
    try {

        const userId =
            req.user?.id ||
            req.user?._id;

        const {
            guestId
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                message:
                    "User authentication required"
            });
        }

        if (!guestId) {
            return res.status(400).json({
                message:
                    "Guest ID is required"
            });
        }

        const guestCart =
            await CartModel.findOne({
                guestId
            });

        if (!guestCart) {
            return res.status(200).json({
                message:
                    "Guest cart not found",
                cart: {
                    items: []
                }
            });
        }

        let userCart =
            await CartModel.findOne({
                user: userId
            });

        if (!userCart) {
            userCart =
                new CartModel({
                    user: userId,
                    guestId: null,
                    items: []
                });
        }

        for (
            const guestItem of guestCart.items
        ) {

            const existingItem =
                userCart.items.find(
                    item =>
                        item.product.toString() ===
                            guestItem.product.toString() &&
                        String(
                            item.size || ""
                        ) ===
                            String(
                                guestItem.size || ""
                            ) &&
                        String(
                            item.color || ""
                        ) ===
                            String(
                                guestItem.color || ""
                            )
                );

            if (existingItem) {

                const product =
                    await ProductModel.findById(
                        guestItem.product
                    );

                if (product) {

                    const newQuantity =
                        Number(
                            existingItem.quantity
                        ) +
                        Number(
                            guestItem.quantity
                        );

                    existingItem.quantity =
                        Math.min(
                            newQuantity,
                            Number(
                                product.stock
                            )
                        );
                }

            } else {

                userCart.items.push({
                    product:
                        guestItem.product,

                    quantity:
                        guestItem.quantity,

                    size:
                        guestItem.size,

                    color:
                        guestItem.color
                });
            }
        }

        await userCart.save();

        await CartModel.deleteOne({
            _id: guestCart._id
        });

        const updatedCart =
            await CartModel.findById(
                userCart._id
            ).populate(
                "items.product"
            );

        return res.status(200).json({
            message:
                "Guest cart merged successfully",
            cart: updatedCart
        });

    } catch (error) {

        console.log(
            "MERGE CART ERROR:",
            error
        );

        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    mergeGuestCart
};