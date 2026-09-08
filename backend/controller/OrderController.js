const OrderModel =
    require("../model/OrderModel");

const CartModel =
    require("../model/CartModel");

const AddressModel =
    require("../model/AddressModel");

const ProductModel =
    require("../model/ProductModel");

const createOrder = async (
    req,
    res
) => {
    try {

        const {
            addressId,
            paymentMethod
        } = req.body;

        const userId =
            req.user?.id ||
            req.user?._id;

        if (!userId) {
            return res.status(401).json({
                message:
                    "User authentication required"
            });
        }

        if (!addressId) {
            return res.status(400).json({
                message:
                    "Address is required"
            });
        }

        let cart =
            await CartModel.findOne({
                user: userId
            }).populate(
                "items.product"
            );

        console.log(
            "ORDER USER:",
            userId
        );

        console.log(
            "USER CART:",
            cart
        );

        if (
            !cart ||
            !cart.items ||
            cart.items.length === 0
        ) {

            const guestId =
                req.body.guestId;

            if (guestId) {

                cart =
                    await CartModel.findOne({
                        guestId
                    }).populate(
                        "items.product"
                    );

                console.log(
                    "GUEST CART:",
                    cart
                );
            }
        }

        if (
            !cart ||
            !cart.items ||
            cart.items.length === 0
        ) {
            return res.status(400).json({
                message:
                    "Cart is empty"
            });
        }

        const address =
            await AddressModel.findOne({
                _id: addressId,
                user: userId
            });

        if (!address) {
            return res.status(404).json({
                message:
                    "Address not found"
            });
        }

        const orderItems = [];

        let subtotal = 0;

        for (
            const item of cart.items
        ) {

            const product =
                item.product;

            if (!product) {
                return res.status(404).json({
                    message:
                        "Product not found"
                });
            }

            const quantity =
                Number(
                    item.quantity || 0
                );

            if (quantity <= 0) {
                return res.status(400).json({
                    message:
                        "Invalid product quantity"
                });
            }

            if (
                Number(product.stock || 0) <
                quantity
            ) {
                return res.status(400).json({
                    message:
                        `${product.name} is out of stock`
                });
            }

            const price =
                Number(
                    product.discountPrice ||
                    product.price ||
                    0
                );

            const total =
                price * quantity;

            subtotal += total;

            orderItems.push({
                product:
                    product._id,

                name:
                    product.name,

                image:
                    product.images?.[0] ||
                    "",

                quantity,

                size:
                    item.size || "",

                color:
                    item.color || "",

                price,

                total
            });
        }

        const shippingCharge =
            subtotal >= 999
                ? 0
                : 99;

        const discount = 0;

        const totalAmount =
            subtotal +
            shippingCharge -
            discount;

        const order =
            await OrderModel.create({

                user:
                    userId,

                items:
                    orderItems,

                shippingAddress: {
                    name:
                        address.name,

                    phone:
                        address.phone,

                    addressLine:
                        address.addressLine,

                    city:
                        address.city,

                    state:
                        address.state,

                    pincode:
                        address.pincode,

                    addressType:
                        address.addressType
                },

                subtotal,

                shippingCharge,

                discount,

                totalAmount,

                paymentMethod:
                    paymentMethod ||
                    "COD"
            });

        for (
            const item of cart.items
        ) {

            await ProductModel.findByIdAndUpdate(
                item.product._id,
                {
                    $inc: {
                        stock:
                            -Number(
                                item.quantity
                            )
                    }
                }
            );
        }

        await CartModel.findByIdAndUpdate(
            cart._id,
            {
                $set: {
                    items: []
                }
            }
        );

        const populatedOrder =
            await OrderModel.findById(
                order._id
            ).populate(
                "items.product"
            );

        console.log(
            "ORDER CREATED:",
            populatedOrder
        );

        res.status(201).json({

            message:
                "Order created successfully",

            order:
                populatedOrder
        });

    } catch (error) {

        console.log(
            "CREATE ORDER ERROR:",
            error
        );

        res.status(500).json({
            message:
                error.message
        });
    }
};

const getMyOrders = async (
    req,
    res
) => {
    try {

        const userId =
            req.user?.id ||
            req.user?._id;

        const orders =
            await OrderModel.find({
                user: userId
            })
                .populate(
                    "items.product"
                )
                .sort({
                    createdAt: -1
                });

        res.status(200).json({
            count:
                orders.length,

            orders
        });

    } catch (error) {

        res.status(500).json({
            message:
                error.message
        });
    }
};

const getOrderById = async (
    req,
    res
) => {
    try {

        const userId =
            req.user?.id ||
            req.user?._id;

        const order =
            await OrderModel.findOne({
                _id:
                    req.params.id,

                user:
                    userId

            }).populate(
                "items.product"
            );

        if (!order) {
            return res.status(404).json({
                message:
                    "Order not found"
            });
        }

        res.status(200).json({
            order
        });

    } catch (error) {

        res.status(500).json({
            message:
                error.message
        });
    }
};

const cancelOrder = async (
    req,
    res
) => {
    try {

        const userId =
            req.user?.id ||
            req.user?._id;

        const order =
            await OrderModel.findOne({
                _id:
                    req.params.id,

                user:
                    userId
            });

        if (!order) {
            return res.status(404).json({
                message:
                    "Order not found"
            });
        }

        if (
            order.orderStatus ===
                "Shipped" ||
            order.orderStatus ===
                "Delivered" ||
            order.orderStatus ===
                "Cancelled"
        ) {
            return res.status(400).json({
                message:
                    "Order cannot be cancelled"
            });
        }

        for (
            const item of order.items
        ) {

            await ProductModel.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock:
                            item.quantity
                    }
                }
            );
        }

        order.orderStatus =
            "Cancelled";

        await order.save();

        res.status(200).json({

            message:
                "Order cancelled successfully",

            order
        });

    } catch (error) {

        res.status(500).json({
            message:
                error.message
        });
    }
};

const getAllOrders = async (
    req,
    res
) => {
    try {

        const orders =
            await OrderModel.find()
                .populate(
                    "user",
                    "name email"
                )
                .populate(
                    "items.product"
                )
                .sort({
                    createdAt: -1
                });

        res.status(200).json({

            count:
                orders.length,

            orders
        });

    } catch (error) {

        res.status(500).json({
            message:
                error.message
        });
    }
};

const updateOrderStatus = async (
    req,
    res
) => {
    try {

        const {
            orderStatus
        } = req.body;

        const allowedStatus = [
            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if (
            !allowedStatus.includes(
                orderStatus
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid order status"
            });
        }

        const order =
            await OrderModel.findByIdAndUpdate(
                req.params.id,
                {
                    orderStatus
                },
                {
                    new: true
                }
            );

        if (!order) {
            return res.status(404).json({
                message:
                    "Order not found"
            });
        }

        res.status(200).json({

            message:
                "Order status updated",

            order
        });

    } catch (error) {

        res.status(500).json({
            message:
                error.message
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
};