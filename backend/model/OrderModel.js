const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },

                name: {
                    type: String,
                    required: true
                },

                image: {
                    type: String,
                    default: ""
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                size: {
                    type: Number,
                    required: true
                },

                color: {
                    type: String,
                    required: true
                },

                price: {
                    type: Number,
                    required: true
                },

                total: {
                    type: Number,
                    required: true
                }
            }
        ],

        shippingAddress: {
            name: {
                type: String,
                required: true
            },

            phone: {
                type: String,
                required: true
            },

            addressLine: {
                type: String,
                required: true
            },

            city: {
                type: String,
                required: true
            },

            state: {
                type: String,
                required: true
            },

            pincode: {
                type: String,
                required: true
            },

            addressType: {
                type: String,
                default: "Home"
            }
        },

        subtotal: {
            type: Number,
            required: true
        },

        shippingCharge: {
            type: Number,
            default: 0
        },

        discount: {
            type: Number,
            default: 0
        },

        totalAmount: {
            type: Number,
            required: true
        },

        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            default: "COD"
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending"
        },

        orderStatus: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel