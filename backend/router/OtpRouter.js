const express = require("express");

const {
    sendOTP,
    verifyOTP
} = require("../controller/OtpController");

const otp_router = express.Router();

otp_router.post(
    "/send",
    sendOTP
);

otp_router.post(
    "/verify",
    verifyOTP
);

module.exports = otp_router