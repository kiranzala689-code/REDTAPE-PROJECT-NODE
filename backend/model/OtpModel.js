const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        otp: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const OtpModel = mongoose.model("OTP", otpSchema);

module.exports = OtpModel