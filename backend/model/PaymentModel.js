const mongoose = require("mongoose");

const paymentSchema =
    new mongoose.Schema(
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            order: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
                required: true
            },

            razorpayOrderId: {
                type: String,
                required: true
            },

            razorpayPaymentId: {
                type: String,
                required: true
            },

            amount: {
                type: Number,
                required: true
            },

            status: {
                type: String,
                default: "Pending"
            }
        },
        {
            timestamps: true
        }
    );

module.exports =
    mongoose.model(
        "Payment",
        paymentSchema
    );