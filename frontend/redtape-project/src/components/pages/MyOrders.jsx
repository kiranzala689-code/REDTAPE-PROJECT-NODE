import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./MyOrders.css";

function MyOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState("");

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

    const getOrders = useCallback(async () => {
        try {
            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            setLoading(true);

            const response = await axios.get(
                "http://localhost:5000/api/orders/my-orders",
                getAuthConfig()
            );

            console.log("MY ORDERS:", response.data);

            const list =
                response.data?.orders ||
                response.data?.data ||
                [];

            setOrders(list);
        } catch (error) {
            console.log(
                "MY ORDERS ERROR:",
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");

                alert("Session expired. Please login again.");

                navigate("/login");

                return;
            }

            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        getOrders();
    }, [getOrders]);

    const cancelOrder = async (orderId) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmCancel) {
            return;
        }

        try {
            setCancelling(orderId);

            const response = await axios.put(
                `http://localhost:5000/api/orders/${orderId}/cancel`,
                {},
                getAuthConfig()
            );

            console.log("CANCEL ORDER:", response.data);

            alert("Order cancelled successfully");

            await getOrders();
        } catch (error) {
            console.log(
                "CANCEL ERROR:",
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");

                alert("Session expired. Please login again.");

                navigate("/login");

                return;
            }

            alert(
                error.response?.data?.message ||
                "Order cancel nahi hua"
            );
        } finally {
            setCancelling("");
        }
    };

    const getStatusClass = (status) => {
        const value = String(status || "").toLowerCase();

        if (
            value === "delivered" ||
            value === "completed"
        ) {
            return "status-delivered";
        }

        if (
            value === "cancelled" ||
            value === "canceled"
        ) {
            return "status-cancelled";
        }

        if (
            value === "shipped" ||
            value === "out for delivery"
        ) {
            return "status-shipped";
        }

        if (
            value === "confirmed" ||
            value === "processing"
        ) {
            return "status-processing";
        }

        return "status-pending";
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const getProductImage = (item) => {
        const product = item?.product || {};

        return (
            product.images?.[0] ||
            product.image ||
            product.img ||
            item?.image ||
            ""
        );
    };

    const getProductName = (item) => {
        return (
            item?.product?.name ||
            item?.name ||
            "Product"
        );
    };

    const getItemQuantity = (item) => {
        return Number(item?.quantity || 1);
    };

    if (loading) {
        return (
            <div className="my-orders-page">
                <div className="container py-5">
                    <div className="text-center py-5">
                        <div
                            className="spinner-border"
                            role="status"
                        />

                        <p className="mt-3 text-muted">
                            Loading your orders...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders-page bg-white">
            <div className="container py-4 py-lg-5">

                <div className="orders-header border-bottom pb-4 mb-5">
                    <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">

                        <div>
                            <p className="small text-muted mb-2">
                                MY ACCOUNT
                            </p>

                            <h1 className="fw-bold mb-2">
                                MY ORDERS
                            </h1>

                            <p className="text-muted mb-0">
                                Track and manage your recent purchases.
                            </p>
                        </div>

                        <Link
                            to="/"
                            className="btn btn-dark rounded-0 px-4"
                        >
                            CONTINUE SHOPPING
                        </Link>

                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-orders text-center py-5">

                        <div className="empty-icon mb-4">
                            🛍️
                        </div>

                        <h3 className="fw-bold">
                            NO ORDERS YET
                        </h3>

                        <p className="text-muted mb-4">
                            You haven't placed any orders yet.
                        </p>

                        <Link
                            to="/"
                            className="btn btn-dark rounded-0 px-5 py-3 fw-bold"
                        >
                            START SHOPPING
                        </Link>

                    </div>
                ) : (
                    <>
                        <div className="orders-count mb-4">
                            <span className="fw-semibold">
                                {orders.length}
                            </span>{" "}
                            {orders.length === 1
                                ? "ORDER"
                                : "ORDERS"}
                        </div>

                        <div className="orders-list">

                            {orders.map((order) => {

                                const items = order.items || [];

                                const status =
                                    order.status || "Pending";

                                const total = Number(
                                    order.totalAmount ||
                                    order.total ||
                                    order.amount ||
                                    0
                                );

                                return (
                                    <div
                                        className="order-card border mb-4"
                                        key={order._id}
                                    >

                                        <div className="order-card-header bg-light border-bottom p-3 p-md-4">

                                            <div className="row g-3 align-items-center">

                                                <div className="col-6 col-md-3">
                                                    <small className="text-muted d-block mb-1">
                                                        ORDER ID
                                                    </small>

                                                    <strong className="small">
                                                        #
                                                        {String(
                                                            order._id
                                                        )
                                                            .slice(-8)
                                                            .toUpperCase()}
                                                    </strong>
                                                </div>

                                                <div className="col-6 col-md-3">
                                                    <small className="text-muted d-block mb-1">
                                                        ORDER DATE
                                                    </small>

                                                    <strong className="small">
                                                        {formatDate(
                                                            order.createdAt ||
                                                            order.orderDate
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="col-6 col-md-3">
                                                    <small className="text-muted d-block mb-1">
                                                        PAYMENT
                                                    </small>

                                                    <strong className="small">
                                                        {String(
                                                            order.paymentMethod ||
                                                            "COD"
                                                        ).replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="col-6 col-md-3 text-md-end">
                                                    <span
                                                        className={`order-status ${getStatusClass(
                                                            status
                                                        )}`}
                                                    >
                                                        {String(
                                                            status
                                                        ).toUpperCase()}
                                                    </span>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="p-3 p-md-4">

                                            {items.map(
                                                (item, index) => {

                                                    const image =
                                                        getProductImage(
                                                            item
                                                        );

                                                    const productName =
                                                        getProductName(
                                                            item
                                                        );

                                                    const quantity =
                                                        getItemQuantity(
                                                            item
                                                        );

                                                    const price =
                                                        Number(
                                                            item.price ||
                                                            item.product
                                                                ?.discountPrice ||
                                                            item.product
                                                                ?.price ||
                                                            0
                                                        );

                                                    return (
                                                        <div
                                                            className="order-product d-flex gap-3 py-3"
                                                            key={
                                                                item._id ||
                                                                index
                                                            }
                                                        >

                                                            <div className="order-product-image bg-light flex-shrink-0">

                                                                {image ? (
                                                                    <img
                                                                        src={
                                                                            image
                                                                        }
                                                                        alt={
                                                                            productName
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <div className="no-image">
                                                                        No Image
                                                                    </div>
                                                                )}

                                                            </div>

                                                            <div className="flex-grow-1">

                                                                <h6 className="fw-bold mb-2">
                                                                    {
                                                                        productName
                                                                    }
                                                                </h6>

                                                                {item.size && (
                                                                    <p className="small text-muted mb-1">
                                                                        Size:{" "}
                                                                        <strong className="text-dark">
                                                                            {
                                                                                item.size
                                                                            }
                                                                        </strong>
                                                                    </p>
                                                                )}

                                                                {item.color && (
                                                                    <p className="small text-muted mb-1">
                                                                        Color:{" "}
                                                                        <strong className="text-dark">
                                                                            {
                                                                                item.color
                                                                            }
                                                                        </strong>
                                                                    </p>
                                                                )}

                                                                <p className="small text-muted mb-0">
                                                                    Qty:{" "}
                                                                    {
                                                                        quantity
                                                                    }
                                                                </p>

                                                            </div>

                                                            <div className="text-end">
                                                                <strong>
                                                                    ₹
                                                                    {(
                                                                        price *
                                                                        quantity
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </strong>
                                                            </div>

                                                        </div>
                                                    );
                                                }
                                            )}

                                            <div className="border-top mt-3 pt-4">

                                                <div className="row g-3 align-items-center">

                                                    <div className="col-md-7">

                                                        {order.address && (
                                                            <div>

                                                                <small className="text-muted d-block mb-1">
                                                                    DELIVERING TO
                                                                </small>

                                                                <strong className="d-block">
                                                                    {
                                                                        order
                                                                            .address
                                                                            .name
                                                                    }
                                                                </strong>

                                                                <small className="text-muted">

                                                                    {
                                                                        order
                                                                            .address
                                                                            .addressLine
                                                                    }

                                                                    {order
                                                                        .address
                                                                        .city
                                                                        ? `, ${order.address.city}`
                                                                        : ""}

                                                                    {order
                                                                        .address
                                                                        .pincode
                                                                        ? ` - ${order.address.pincode}`
                                                                        : ""}

                                                                </small>

                                                            </div>
                                                        )}

                                                    </div>

                                                    <div className="col-md-5">

                                                        <div className="d-flex justify-content-between mb-2">

                                                            <span className="text-muted">
                                                                Total
                                                            </span>

                                                            <strong>
                                                                ₹
                                                                {total.toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                            </strong>

                                                        </div>

                                                        <div className="d-flex gap-2 justify-content-md-end flex-wrap">

                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-dark rounded-0 px-4"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/orders/${order._id}`
                                                                    )
                                                                }
                                                            >
                                                                VIEW DETAILS
                                                            </button>

                                                            {String(
                                                                status
                                                            ).toLowerCase() !==
                                                                "delivered" &&
                                                                String(
                                                                    status
                                                                ).toLowerCase() !==
                                                                    "cancelled" &&
                                                                String(
                                                                    status
                                                                ).toLowerCase() !==
                                                                    "canceled" && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-dark rounded-0 px-4"
                                                                        disabled={
                                                                            cancelling ===
                                                                            order._id
                                                                        }
                                                                        onClick={() =>
                                                                            cancelOrder(
                                                                                order._id
                                                                            )
                                                                        }
                                                                    >
                                                                        {cancelling ===
                                                                        order._id
                                                                            ? "CANCELLING..."
                                                                            : "CANCEL ORDER"}
                                                                    </button>
                                                                )}

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

export default MyOrders;