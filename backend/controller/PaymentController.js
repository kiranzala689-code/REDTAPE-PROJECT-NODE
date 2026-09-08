const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../model/OrderModel");
const Payment = require("../model/PaymentModel");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createPaymentOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { orderId } = req.body;

        console.log("PAYMENT USER:", userId);
        console.log("PAYMENT ORDER ID:", orderId);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        if (
            !process.env.RAZORPAY_KEY_ID ||
            !process.env.RAZORPAY_KEY_SECRET
        ) {
            return res.status(500).json({
                success: false,
                message: "Razorpay keys are missing"
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: userId
        });

        console.log("DATABASE ORDER:", order);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const amount = Number(
            order.totalAmount ||
            order.total ||
            order.amount ||
            0
        );

        console.log("ORDER AMOUNT:", amount);

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order amount"
            });
        }

        const razorpayOrder =
            await razorpay.orders.create({
                amount: Math.round(amount * 100),
                currency: "INR",
                receipt: `receipt_${String(order._id).slice(-12)}_${Date.now()}`
            });

        console.log(
            "RAZORPAY ORDER CREATED:",
            razorpayOrder
        );

        return res.status(201).json({
            success: true,
            message: "Payment order created",
            key: process.env.RAZORPAY_KEY_ID,
            paymentOrder: razorpayOrder
        });

    } catch (error) {
        console.log(
            "RAZORPAY CREATE ERROR:",
            error?.error || error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.error?.description ||
                error?.message ||
                "Payment order create failed",
            code:
                error?.error?.code || null
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const userId = req.user?.id;

        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        if (
            !orderId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details are required"
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            user: userId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");

        if (
            generatedSignature !==
            razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        order.paymentStatus = "Paid";
        order.status = "Confirmed";

        await order.save();

        const existingPayment =
            await Payment.findOne({
                razorpayPaymentId:
                    razorpay_payment_id
            });

        if (existingPayment) {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                payment: existingPayment,
                order
            });
        }

        const payment =
            await Payment.create({
                user: userId,
                order: order._id,
                razorpayOrderId:
                    razorpay_order_id,
                razorpayPaymentId:
                    razorpay_payment_id,
                amount:
                    Number(
                        order.totalAmount ||
                        order.total ||
                        order.amount ||
                        0
                    ),
                status: "Paid"
            });

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            payment,
            order
        });

    } catch (error) {
        console.log(
            "PAYMENT VERIFY ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "Payment verification failed"
        });
    }
};

const getMyPayments = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        const payments =
            await Payment.find({
                user: userId
            })
                .populate("order")
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            success: true,
            payments
        });

    } catch (error) {
        console.log(
            "GET PAYMENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Payments load failed"
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getMyPayments
};