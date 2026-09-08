import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Payment.css";

function Payment() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const getAuthConfig = () => {
        const token = getToken();

        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    const getOrder = async () => {
        try {
            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `http://localhost:5000/api/orders/${orderId}`,
                getAuthConfig()
            );

            const orderData =
                response.data?.order ||
                response.data?.data ||
                response.data;

            setOrder(orderData);
        } catch (error) {
            console.log(
                "ORDER ERROR:",
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            alert(
                error.response?.data?.message ||
                "Order load nahi hua"
            );

            navigate("/orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getOrder();
    }, [orderId]);

    const loadRazorpay = () => {
        return new Promise(resolve => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");

            script.src =
                "https://checkout.razorpay.com/v1/checkout.js";

            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        try {
            setPaying(true);

            const razorpayLoaded =
                await loadRazorpay();

            if (!razorpayLoaded) {
                alert(
                    "Razorpay load nahi hua. Internet check karo."
                );
                return;
            }

            const response =
                await axios.post(
                    "http://localhost:5000/api/payment/create",
                    {
                        orderId
                    },
                    getAuthConfig()
                );

            const paymentOrder =
                response.data?.paymentOrder ||
                response.data?.order ||
                response.data;

            if (!paymentOrder?.id) {
                alert(
                    "Payment order create nahi hua"
                );
                return;
            }

            const options = {
                key: response.data.key,
                amount: paymentOrder.amount,
                currency:
                    paymentOrder.currency || "INR",
                name: "REDTAPE",
                description:
                    "Order Payment",
                order_id: paymentOrder.id,

                handler: async function (payment) {
                    try {
                        const verifyResponse =
                            await axios.post(
                                "http://localhost:5000/api/payment/verify",
                                {
                                    razorpay_order_id:
                                        payment.razorpay_order_id,
                                    razorpay_payment_id:
                                        payment.razorpay_payment_id,
                                    razorpay_signature:
                                        payment.razorpay_signature,
                                    orderId
                                },
                                getAuthConfig()
                            );

                        if (
                            verifyResponse.data
                                ?.success ||
                            verifyResponse.data
                                ?.message
                        ) {
                            alert(
                                "Payment successful"
                            );

                            navigate(
                                `/orders/${orderId}`
                            );
                        } else {
                            alert(
                                "Payment verification failed"
                            );
                        }
                    } catch (error) {
                        console.log(
                            "VERIFY ERROR:",
                            error.response
                                ?.data ||
                            error.message
                        );

                        alert(
                            error.response?.data
                                ?.message ||
                            "Payment verification failed"
                        );
                    }
                },

                prefill: {
                    name:
                        order?.user?.name ||
                        "",
                    email:
                        order?.user?.email ||
                        "",
                    contact:
                        order?.address?.phone ||
                        ""
                },

                theme: {
                    color: "#000000"
                },

                modal: {
                    ondismiss: function () {
                        setPaying(false);
                    }
                }
            };

            const razorpay =
                new window.Razorpay(options);

            razorpay.on(
                "payment.failed",
                function (response) {
                    console.log(
                        "PAYMENT FAILED:",
                        response.error
                    );

                    alert(
                        response.error
                            ?.description ||
                        "Payment failed"
                    );

                    setPaying(false);
                }
            );

            razorpay.open();
        } catch (error) {
            console.log(
                "PAYMENT ERROR:",
                error.response?.data ||
                error.message
            );

            if (
                error.response?.status === 401
            ) {
                localStorage.removeItem(
                    "token"
                );

                alert(
                    "Session expired. Please login again."
                );

                navigate("/login");
                return;
            }

            alert(
                error.response?.data?.message ||
                "Payment start nahi hua"
            );
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">
                    <div
                        className="spinner-border"
                        role="status"
                    />
                    <p className="mt-3">
                        Loading payment...
                    </p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">
                    <h3 className="fw-bold">
                        ORDER NOT FOUND
                    </h3>

                    <Link
                        to="/orders"
                        className="btn btn-dark rounded-0 px-5 py-3 mt-3"
                    >
                        MY ORDERS
                    </Link>
                </div>
            </div>
        );
    }

    const totalAmount = Number(
        order.totalAmount ||
        order.total ||
        order.amount ||
        0
    );

    return (
        <div className="payment-page bg-white">
            <div className="container py-4 py-lg-5">

                <div className="border-bottom pb-4 mb-5">
                    <Link
                        to="/checkout"
                        className="text-dark text-decoration-none fw-semibold"
                    >
                        ← BACK TO CHECKOUT
                    </Link>

                    <h1 className="fw-bold mt-3 mb-2">
                        PAYMENT
                    </h1>

                    <p className="text-muted mb-0">
                        Complete your order payment securely
                    </p>
                </div>

                <div className="row justify-content-center">

                    <div className="col-lg-6">

                        <div className="border p-4 p-lg-5">

                            <div className="text-center border-bottom pb-4 mb-4">

                                <h5 className="fw-bold mb-2">
                                    REDTAPE
                                </h5>

                                <p className="text-muted small mb-0">
                                    Secure Online Payment
                                </p>

                            </div>

                            <div className="d-flex justify-content-between mb-3">
                                <span>
                                    Order ID
                                </span>

                                <strong className="small">
                                    {String(orderId)
                                        .slice(-10)
                                        .toUpperCase()}
                                </strong>
                            </div>

                            <div className="d-flex justify-content-between mb-4">
                                <span>
                                    Payment Method
                                </span>

                                <strong>
                                    ONLINE
                                </strong>
                            </div>

                            <div className="bg-light p-4 mb-4">

                                <div className="d-flex justify-content-between align-items-center">

                                    <span className="fw-semibold">
                                        Amount Payable
                                    </span>

                                    <strong className="fs-3">
                                        ₹
                                        {totalAmount.toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>

                                </div>

                            </div>

                            <button
                                type="button"
                                className="btn btn-dark rounded-0 w-100 py-3 fw-bold"
                                disabled={paying}
                                onClick={handlePayment}
                            >
                                {paying
                                    ? "PROCESSING..."
                                    : "PAY NOW →"}
                            </button>

                            <div className="text-center mt-4">

                                <p className="small text-muted mb-0">
                                    🔒 Secure payment powered by Razorpay
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default Payment;