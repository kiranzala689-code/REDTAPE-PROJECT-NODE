const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    brand: {
      type: String,
      default: "WROGN"
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Footwear",
        "Pants",
        "Shirts",
        "Womens",
        "Accessories",
        "New Arrival"
      ]
    },

    subCategory: {
      type: String,
      default: ""
    },

    gender: {
      type: String,
      required: true,
      enum: [
        "Men",
        "Women",
        "Kids",
        "Unisex"
      ]
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    discountPrice: {
      type: Number,
      min: 0
    },

    images: {
      type: [String],
      required: true
    },

    sizes: {
      type: [mongoose.Schema.Types.Mixed],
      required: true
    },

    colors: {
      type: [String],
      default: []
    },

    material: {
      type: String,
      default: ""
    },

    stock: {
      type: Number,
      required: true,
      min: 0
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    reviewsCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

const ProductModel = mongoose.model(
  "Product",
  productSchema
);

module.exports = ProductModel;