import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./OrderDetails.css";

const API_URL = "https://redtape-project-node-4.onrender.com";

function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    const getToken = useCallback(() => {
        return localStorage.getItem("token");
    }, []);

    const getAuthConfig = useCallback(() => {
        const token = getToken();

        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }, [getToken]);

    const getOrder = useCallback(async () => {
        try {
            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            setLoading(true);

            const response = await axios.get(
                `${API_URL}/api/orders/${id}`,
                getAuthConfig()
            );

            console.log("ORDER DETAILS:", response.data);

            const orderData =
                response.data?.order ||
                response.data?.data ||
                response.data;

            setOrder(orderData);
        } catch (error) {
            console.log(
                "ORDER DETAILS ERROR:",
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
                "Order details load nahi hue"
            );

            navigate("/orders");
        } finally {
            setLoading(false);
        }
    }, [id, navigate, getToken, getAuthConfig]);

    useEffect(() => {
        getOrder();
    }, [getOrder]);

    const cancelOrder = async () => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmCancel) {
            return;
        }

        try {
            setCancelling(true);

            const response = await axios.put(
                `${API_URL}/api/orders/${id}/cancel`,
                {},
                getAuthConfig()
            );

            console.log("CANCEL RESPONSE:", response.data);

            alert("Order cancelled successfully");

            await getOrder();
        } catch (error) {
            console.log(
                "CANCEL ORDER ERROR:",
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
            setCancelling(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
    };

    const formatDateTime = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    const getStatusClass = (status) => {
        const value = String(status || "").toLowerCase();

        if (
            value === "delivered" ||
            value === "completed"
        ) {
            return "details-status-delivered";
        }

        if (
            value === "cancelled" ||
            value === "canceled"
        ) {
            return "details-status-cancelled";
        }

        if (
            value === "shipped" ||
            value === "out for delivery"
        ) {
            return "details-status-shipped";
        }

        if (
            value === "confirmed" ||
            value === "processing"
        ) {
            return "details-status-processing";
        }

        return "details-status-pending";
    };

    const getPaymentStatusClass = (status) => {
        const value = String(status || "").toLowerCase();

        if (
            value === "paid" ||
            value === "success" ||
            value === "completed"
        ) {
            return "text-success";
        }

        if (
            value === "failed" ||
            value === "cancelled"
        ) {
            return "text-danger";
        }

        return "text-warning";
    };

    const getItemPrice = (item) => {
        return Number(
            item?.price ||
            item?.product?.discountPrice ||
            item?.product?.price ||
            0
        );
    };

    if (loading) {
        return (
            <div className="order-details-page">
                <div className="container py-5">
                    <div className="text-center py-5">
                        <div
                            className="spinner-border"
                            role="status"
                        />

                        <p className="mt-3 text-muted">
                            Loading order details...
                        </p>
                    </div>
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

                    <p className="text-muted">
                        We couldn't find this order.
                    </p>

                    <Link
                        to="/orders"
                        className="btn btn-dark rounded-0 px-5 py-3"
                    >
                        BACK TO ORDERS
                    </Link>
                </div>
            </div>
        );
    }

    const items = order.items || [];

    const status = order.status || "Pending";

    const paymentMethod =
        order.paymentMethod || "COD";

    const paymentStatus =
        order.paymentStatus ||
        order.payment?.status ||
        "Pending";

    const subtotal = Number(order.subtotal || 0);

    const shipping = Number(
        order.shippingCharge ||
        order.shipping ||
        0
    );

    const discount = Number(
        order.discount || 0
    );

    const total = Number(
        order.totalAmount ||
        order.total ||
        order.amount ||
        0
    );

    const address =
        order.address ||
        order.shippingAddress ||
        {};

    const canCancel =
        String(status).toLowerCase() !== "delivered" &&
        String(status).toLowerCase() !== "cancelled" &&
        String(status).toLowerCase() !== "canceled" &&
        String(status).toLowerCase() !== "shipped";

    return (
        <div className="order-details-page bg-white">
            <div className="container py-4 py-lg-5">

                <div className="order-details-top border-bottom pb-4 mb-5">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                        <div>
                            <Link
                                to="/orders"
                                className="text-dark text-decoration-none small fw-semibold"
                            >
                                ← BACK TO ORDERS
                            </Link>

                            <h1 className="fw-bold mt-3 mb-2">
                                ORDER DETAILS
                            </h1>

                            <p className="text-muted mb-0">
                                Order #
                                {String(order._id)
                                    .slice(-10)
                                    .toUpperCase()}
                            </p>
                        </div>

                        <span
                            className={`order-details-status ${getStatusClass(
                                status
                            )}`}
                        >
                            {String(status).toUpperCase()}
                        </span>

                    </div>
                </div>

                <div className="row g-5">

                    <div className="col-lg-8">

                        <div className="border p-3 p-md-4 mb-4">

                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">

                                <h4 className="fw-bold mb-0">
                                    ORDERED ITEMS
                                </h4>

                                <span className="small text-muted">
                                    {items.length}{" "}
                                    {items.length === 1
                                        ? "ITEM"
                                        : "ITEMS"}
                                </span>

                            </div>

                            {items.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    No items found.
                                </div>
                            ) : (
                                items.map((item, index) => {

                                    const product =
                                        item.product || {};

                                    const image =
                                        product.images?.[0] ||
                                        product.image ||
                                        "";

                                    const name =
                                        product.name ||
                                        item.name ||
                                        "Product";

                                    const quantity =
                                        Number(
                                            item.quantity || 1
                                        );

                                    const price =
                                        getItemPrice(item);

                                    const itemTotal =
                                        Number(
                                            item.total ||
                                            price * quantity
                                        );

                                    return (
                                        <div
                                            className="order-detail-product d-flex gap-3 py-4"
                                            key={
                                                item._id ||
                                                index
                                            }
                                        >

                                            <Link
                                                to={`/product/${product._id}`}
                                                className="order-detail-image bg-light flex-shrink-0"
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={name}
                                                    />
                                                ) : (
                                                    <div className="no-image">
                                                        No Image
                                                    </div>
                                                )}
                                            </Link>

                                            <div className="flex-grow-1">

                                                <Link
                                                    to={`/product/${product._id}`}
                                                    className="text-dark text-decoration-none"
                                                >
                                                    <h6 className="fw-bold mb-2">
                                                        {name}
                                                    </h6>
                                                </Link>

                                                <div className="small text-muted">

                                                    {item.size && (
                                                        <div>
                                                            Size:{" "}
                                                            <strong className="text-dark">
                                                                {item.size}
                                                            </strong>
                                                        </div>
                                                    )}

                                                    {item.color && (
                                                        <div className="mt-1">
                                                            Color:{" "}
                                                            <strong className="text-dark">
                                                                {item.color}
                                                            </strong>
                                                        </div>
                                                    )}

                                                    <div className="mt-1">
                                                        Quantity:{" "}
                                                        <strong className="text-dark">
                                                            {quantity}
                                                        </strong>
                                                    </div>

                                                </div>

                                            </div>

                                            <div className="text-end">

                                                <strong>
                                                    ₹
                                                    {itemTotal.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>

                                                <div className="small text-muted mt-1">
                                                    ₹
                                                    {price.toLocaleString(
                                                        "en-IN"
                                                    )}{" "}
                                                    each
                                                </div>

                                            </div>

                                        </div>
                                    );
                                })
                            )}

                        </div>

                        <div className="row g-4">

                            <div className="col-md-6">

                                <div className="border p-4 h-100">

                                    <h5 className="fw-bold mb-4">
                                        DELIVERY ADDRESS
                                    </h5>

                                    {address &&
                                    Object.keys(address).length > 0 ? (
                                        <div>

                                            <h6 className="fw-bold mb-2">
                                                {address.name}
                                            </h6>

                                            <p className="small text-muted mb-2">
                                                {address.addressLine}
                                            </p>

                                            <p className="small text-muted mb-2">
                                                {address.city}

                                                {address.city &&
                                                    address.state &&
                                                    ", "}

                                                {address.state}

                                                {(address.city ||
                                                    address.state) &&
                                                    address.pincode &&
                                                    " - "}

                                                {address.pincode}
                                            </p>

                                            {address.phone && (
                                                <p className="small text-muted mb-0">
                                                    Mobile:{" "}
                                                    <strong className="text-dark">
                                                        {address.phone}
                                                    </strong>
                                                </p>
                                            )}

                                            {address.addressType && (
                                                <span className="badge bg-dark rounded-0 mt-3">
                                                    {address.addressType}
                                                </span>
                                            )}

                                        </div>
                                    ) : (
                                        <p className="text-muted small mb-0">
                                            Delivery address information not available.
                                        </p>
                                    )}

                                </div>

                            </div>

                            <div className="col-md-6">

                                <div className="border p-4 h-100">

                                    <h5 className="fw-bold mb-4">
                                        PAYMENT INFORMATION
                                    </h5>

                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted">
                                            Method
                                        </span>

                                        <strong>
                                            {String(
                                                paymentMethod
                                            ).replace(
                                                "_",
                                                " "
                                            )}
                                        </strong>
                                    </div>

                                    <div className="d-flex justify-content-between mb-3">

                                        <span className="text-muted">
                                            Status
                                        </span>

                                        <strong
                                            className={getPaymentStatusClass(
                                                paymentStatus
                                            )}
                                        >
                                            {String(
                                                paymentStatus
                                            ).toUpperCase()}
                                        </strong>

                                    </div>

                                    <div className="d-flex justify-content-between">

                                        <span className="text-muted">
                                            Order Date
                                        </span>

                                        <strong className="small">
                                            {formatDate(
                                                order.createdAt ||
                                                order.orderDate
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="col-lg-4">

                        <div className="border p-4 order-summary-box">

                            <h4 className="fw-bold border-bottom pb-3 mb-4">
                                ORDER SUMMARY
                            </h4>

                            <div className="d-flex justify-content-between mb-3">

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    ₹
                                    {subtotal > 0
                                        ? subtotal.toLocaleString(
                                            "en-IN"
                                        )
                                        : items
                                            .reduce(
                                                (
                                                    sum,
                                                    item
                                                ) =>
                                                    sum +
                                                    getItemPrice(
                                                        item
                                                    ) *
                                                    Number(
                                                        item.quantity ||
                                                        1
                                                    ),
                                                0
                                            )
                                            .toLocaleString(
                                                "en-IN"
                                            )}
                                </strong>

                            </div>

                            <div className="d-flex justify-content-between mb-3">

                                <span>
                                    Shipping
                                </span>

                                <strong>
                                    {shipping === 0
                                        ? "FREE"
                                        : `₹${shipping.toLocaleString(
                                            "en-IN"
                                        )}`}
                                </strong>

                            </div>

                            <div className="d-flex justify-content-between mb-3">

                                <span>
                                    Discount
                                </span>

                                <strong>
                                    ₹
                                    {discount.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>

                            <hr />

                            <div className="d-flex justify-content-between align-items-center mb-4">

                                <strong className="fs-5">
                                    TOTAL
                                </strong>

                                <strong className="fs-4">
                                    ₹
                                    {total.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>

                            <div className="border-top pt-4">

                                <div className="d-flex justify-content-between mb-3">

                                    <span className="text-muted">
                                        Order Status
                                    </span>

                                    <span
                                        className={`small fw-bold ${getStatusClass(
                                            status
                                        )}`}
                                    >
                                        {String(
                                            status
                                        ).toUpperCase()}
                                    </span>

                                </div>

                                <div className="d-flex justify-content-between">

                                    <span className="text-muted">
                                        Placed On
                                    </span>

                                    <span className="small fw-semibold">
                                        {formatDateTime(
                                            order.createdAt ||
                                            order.orderDate
                                        )}
                                    </span>

                                </div>

                            </div>

                            {canCancel && (
                                <button
                                    type="button"
                                    className="btn btn-outline-dark rounded-0 w-100 py-3 mt-4 fw-bold"
                                    disabled={cancelling}
                                    onClick={cancelOrder}
                                >
                                    {cancelling
                                        ? "CANCELLING..."
                                        : "CANCEL ORDER"}
                                </button>
                            )}

                            <Link
                                to="/orders"
                                className="btn btn-dark rounded-0 w-100 py-3 mt-2 fw-bold"
                            >
                                BACK TO MY ORDERS
                            </Link>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default OrderDetails;