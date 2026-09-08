const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },

        size: {
            type: String,
            required: true
        },

        color: {
            type: String,
            required: true
        }
    },
    {
        _id: true
    }
);

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        guestId: {
            type: String,
            default: null
        },

        items: {
            type: [cartItemSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const CartModel = mongoose.model(
    "Cart",
    cartSchema
);

module.exports = CartModel;