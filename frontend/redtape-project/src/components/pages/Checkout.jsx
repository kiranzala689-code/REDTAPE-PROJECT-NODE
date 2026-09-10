import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Checkout.css";

const API_URL = "https://redtape-project-node-4.onrender.com";

function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState({
        items: []
    });

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [loading, setLoading] = useState(true);
    const [savingAddress, setSavingAddress] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [addressForm, setAddressForm] = useState({
        name: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
        addressType: "Home"
    });

    const getToken = useCallback(() => {
        return localStorage.getItem("token");
    }, []);

    const getUserId = useCallback(() => {
        const token = getToken();

        if (!token) {
            return null;
        }

        try {
            const parts = token.split(".");

            if (parts.length !== 3) {
                return null;
            }

            const payload = JSON.parse(
                atob(
                    parts[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

            return payload.id || payload._id || null;
        } catch (error) {
            console.log("TOKEN ERROR:", error.message);
            return null;
        }
    }, [getToken]);

    const getGuestId = useCallback(() => {
        let guestId = localStorage.getItem("guestId");

        if (!guestId) {
            guestId =
                "guest_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 10);

            localStorage.setItem("guestId", guestId);
        }

        return guestId;
    }, []);

    const getAuthConfig = useCallback(() => {
        const token = getToken();

        if (!token) {
            return {};
        }

        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }, [getToken]);

    const getCartConfig = useCallback(() => {
        const token = getToken();
        const userId = getUserId();

        if (token && userId) {
            return {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    userId
                }
            };
        }

        return {
            params: {
                guestId: getGuestId()
            }
        };
    }, [getToken, getUserId, getGuestId]);

    const getCart = useCallback(async () => {
        try {
            const userId = getUserId();

            let guestId = null;

            if (!userId) {
                guestId =
                    localStorage.getItem("guestId") ||
                    getGuestId();
            }

            console.log("CHECKOUT OWNER:", {
                userId,
                guestId
            });

            const response = await axios.get(
                `${API_URL}/api/cart`,
                getCartConfig()
            );

            console.log(
                "CHECKOUT CART:",
                response.data
            );

            const cartData =
                response.data?.cart ||
                response.data?.data;

            setCart(
                cartData || {
                    items: []
                }
            );
        } catch (error) {
            console.log(
                "CHECKOUT CART ERROR:",
                error.response?.data ||
                error.message
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");

                alert(
                    "Session expired. Please login again."
                );

                navigate("/login");

                return;
            }

            setCart({
                items: []
            });
        }
    }, [
        getUserId,
        getGuestId,
        getCartConfig,
        navigate
    ]);

    const getAddresses = useCallback(async () => {
        try {
            const token = getToken();
            const userId = getUserId();

            if (!token || !userId) {
                setAddresses([]);
                return;
            }

            const response = await axios.get(
                `${API_URL}/api/address`,
                getAuthConfig()
            );

            console.log(
                "ADDRESS RESPONSE:",
                response.data
            );

            const list =
                response.data?.addresses ||
                response.data?.data ||
                [];

            setAddresses(list);

            if (list.length > 0) {
                setSelectedAddress(list[0]._id);
            }
        } catch (error) {
            console.log(
                "ADDRESS ERROR:",
                error.response?.data ||
                error.message
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");

                alert(
                    "Session expired. Please login again."
                );

                navigate("/login");

                return;
            }

            setAddresses([]);
        }
    }, [
        getToken,
        getUserId,
        getAuthConfig,
        navigate
    ]);

    useEffect(() => {
        const loadPage = async () => {
            setLoading(true);

            const token = getToken();

            if (!token) {
                setLoading(false);
                navigate("/login");
                return;
            }

            await getCart();
            await getAddresses();

            setLoading(false);
        };

        loadPage();
    }, [
        getToken,
        getCart,
        getAddresses,
        navigate
    ]);

    useEffect(() => {
        const refreshCart = () => {
            getCart();
        };

        window.addEventListener(
            "cartUpdated",
            refreshCart
        );

        return () => {
            window.removeEventListener(
                "cartUpdated",
                refreshCart
            );
        };
    }, [getCart]);

    const getPrice = product => {
        return Number(
            product?.discountPrice ||
            product?.price ||
            0
        );
    };

    const totalItems =
        cart.items?.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        ) || 0;

    const subtotal =
        cart.items?.reduce(
            (total, item) => {
                const product =
                    item.product || {};

                const price =
                    getPrice(product);

                const quantity =
                    Number(item.quantity || 0);

                return (
                    total +
                    price * quantity
                );
            },
            0
        ) || 0;

    const shippingCharge =
        subtotal >= 999 ||
        subtotal === 0
            ? 0
            : 99;

    const discount = 0;

    const totalAmount =
        subtotal +
        shippingCharge -
        discount;

    const handleAddressChange = event => {
        const {
            name,
            value
        } = event.target;

        setAddressForm(previous => ({
            ...previous,
            [name]: value
        }));
    };

    const saveAddress = async event => {
        event.preventDefault();

        const token = getToken();
        const userId = getUserId();

        if (!token || !userId) {
            alert("Please login first");
            navigate("/login");
            return;
        }

        try {
            setSavingAddress(true);

            const response =
                await axios.post(
                    `${API_URL}/api/address`,
                    addressForm,
                    getAuthConfig()
                );

            console.log(
                "ADDRESS SAVED:",
                response.data
            );

            const newAddress =
                response.data?.address ||
                response.data?.data;

            if (newAddress) {
                setAddresses(previous => [
                    newAddress,
                    ...previous
                ]);

                setSelectedAddress(
                    newAddress._id
                );
            } else {
                await getAddresses();
            }

            setAddressForm({
                name: "",
                phone: "",
                addressLine: "",
                city: "",
                state: "",
                pincode: "",
                addressType: "Home"
            });

            setShowAddressForm(false);
        } catch (error) {
            console.log(
                "SAVE ADDRESS ERROR:",
                error.response?.data ||
                error.message
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");

                alert(
                    "Session expired. Please login again."
                );

                navigate("/login");

                return;
            }

            alert(
                error.response?.data?.message ||
                "Address save nahi hua"
            );
        } finally {
            setSavingAddress(false);
        }
    };

    const placeOrder = async () => {
        try {
            const token = getToken();
            const userId = getUserId();

            console.log(
                "PLACE ORDER USER:",
                userId
            );

            if (!token || !userId) {
                alert("Please login first");
                navigate("/login");
                return;
            }

            if (!selectedAddress) {
                alert(
                    "Please select delivery address"
                );
                return;
            }

            if (
                !cart.items ||
                cart.items.length === 0
            ) {
                alert("Cart is empty");
                await getCart();
                return;
            }

            setPlacingOrder(true);

            const orderData = {
                addressId: selectedAddress,
                paymentMethod
            };

            console.log(
                "ORDER DATA:",
                orderData
            );

            const response =
                await axios.post(
                    `${API_URL}/api/orders`,
                    orderData,
                    getAuthConfig()
                );

            console.log(
                "ORDER RESPONSE:",
                response.data
            );

            const order =
                response.data?.order;

            if (!order || !order._id) {
                alert(
                    "Order create nahi hua"
                );
                return;
            }

            if (paymentMethod === "ONLINE") {
                navigate(
                    `/payment/${order._id}`
                );
                return;
            }

            alert(
                "Order placed successfully"
            );

            navigate(
                `/orders/${order._id}`
            );
        } catch (error) {
            console.log(
                "ORDER ERROR:",
                error.response?.data ||
                error.message
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");

                alert(
                    "Session expired. Please login again."
                );

                navigate("/login");

                return;
            }

            alert(
                error.response?.data?.message ||
                "Order place nahi hua"
            );
        } finally {
            setPlacingOrder(false);
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
                        Loading checkout...
                    </p>
                </div>
            </div>
        );
    }

    if (
        !cart.items ||
        cart.items.length === 0
    ) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">
                    <div className="display-3 mb-3">
                        🛒
                    </div>

                    <h3 className="fw-bold">
                        YOUR BAG IS EMPTY
                    </h3>

                    <p className="text-muted">
                        Add products to your cart
                        before checkout.
                    </p>

                    <Link
                        to="/cart-page"
                        className="btn btn-dark rounded-0 px-5 py-3"
                    >
                        BACK TO CART
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page bg-white">
            <div className="container py-4 py-lg-5">

                <div className="d-flex justify-content-between align-items-center border-bottom pb-4 mb-5">

                    <Link
                        to="/cart-page"
                        className="text-dark text-decoration-none fw-semibold"
                    >
                        ← BACK TO CART
                    </Link>

                    <h1 className="fw-bold mb-0">
                        CHECKOUT
                    </h1>

                    <span className="small text-muted">
                        {totalItems} ITEMS
                    </span>

                </div>

                <div className="row g-5">

                    <div className="col-lg-7">

                        <div className="mb-5">

                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">

                                <h4 className="fw-bold mb-0">
                                    01. DELIVERY ADDRESS
                                </h4>

                                <button
                                    type="button"
                                    className="btn btn-dark rounded-0 btn-sm"
                                    onClick={() =>
                                        setShowAddressForm(
                                            !showAddressForm
                                        )
                                    }
                                >
                                    + ADD ADDRESS
                                </button>

                            </div>

                            {!getUserId() ? (
                                <div className="border p-4 text-center">

                                    <p className="text-muted mb-3">
                                        Please login to add
                                        delivery address.
                                    </p>

                                    <button
                                        type="button"
                                        className="btn btn-dark rounded-0"
                                        onClick={() =>
                                            navigate(
                                                "/login"
                                            )
                                        }
                                    >
                                        LOGIN
                                    </button>

                                </div>
                            ) : addresses.length > 0 ? (
                                <div className="row g-3">

                                    {addresses.map(
                                        address => (
                                            <div
                                                className="col-md-6"
                                                key={
                                                    address._id
                                                }
                                            >

                                                <label
                                                    className={
                                                        selectedAddress ===
                                                        address._id
                                                            ? "border border-dark p-4 d-block h-100"
                                                            : "border p-4 d-block h-100"
                                                    }
                                                    style={{
                                                        cursor:
                                                            "pointer"
                                                    }}
                                                >

                                                    <div className="d-flex justify-content-between mb-3">

                                                        <div className="d-flex gap-2">

                                                            <input
                                                                type="radio"
                                                                name="address"
                                                                checked={
                                                                    selectedAddress ===
                                                                    address._id
                                                                }
                                                                onChange={() =>
                                                                    setSelectedAddress(
                                                                        address._id
                                                                    )
                                                                }
                                                            />

                                                            <strong>
                                                                {
                                                                    address.name
                                                                }
                                                            </strong>

                                                        </div>

                                                        <span className="badge bg-dark rounded-0">
                                                            {
                                                                address.addressType ||
                                                                "HOME"
                                                            }
                                                        </span>

                                                    </div>

                                                    <p className="small mb-2">
                                                        {
                                                            address.addressLine
                                                        }
                                                    </p>

                                                    <p className="small mb-2">
                                                        {
                                                            address.city
                                                        }
                                                        ,{" "}
                                                        {
                                                            address.state
                                                        }{" "}
                                                        -{" "}
                                                        {
                                                            address.pincode
                                                        }
                                                    </p>

                                                    <p className="small text-muted mb-0">
                                                        Mobile:{" "}
                                                        {
                                                            address.phone
                                                        }
                                                    </p>

                                                </label>

                                            </div>
                                        )
                                    )}

                                </div>
                            ) : (
                                <div className="border p-4 text-center">

                                    <p className="text-muted">
                                        No saved address found.
                                    </p>

                                    <button
                                        type="button"
                                        className="btn btn-dark rounded-0"
                                        onClick={() =>
                                            setShowAddressForm(
                                                true
                                            )
                                        }
                                    >
                                        ADD NEW ADDRESS
                                    </button>

                                </div>
                            )}

                            {showAddressForm &&
                                getUserId() && (
                                    <form
                                        className="border p-4 mt-4"
                                        onSubmit={
                                            saveAddress
                                        }
                                    >

                                        <h5 className="fw-bold mb-4">
                                            ADD NEW ADDRESS
                                        </h5>

                                        <div className="row g-3">

                                            <div className="col-md-6">

                                                <label className="form-label">
                                                    Full Name
                                                </label>

                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control rounded-0"
                                                    value={
                                                        addressForm.name
                                                    }
                                                    onChange={
                                                        handleAddressChange
                                                    }
                                                    required
                                                />

                                            </div>

                                            <div className="col-md-6">

                                                <label className="form-label">
                                                    Phone
                                                </label>

                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    className="form-control rounded-0"
                                                    value={
                                                        addressForm.phone
                                                    }
                                                    onChange={
                                                        handleAddressChange
                                                    }
                                                    maxLength="10"
                                                    pattern="[0-9]{10}"
                                                    required
                                                />

                                            </div>

                                            <div className="col-12">

                                                <label className="form-label">
                                                    Address
                                                </label>

                                                <textarea
                                                    name="addressLine"
                                                    rows="3"
                                                    className="form-control rounded-0"
                                                    value={
                                                        addressForm.addressLine
                                                    }
                                                    onChange={
                                                        handleAddressChange
                                                    }
                                                    required
                                                />

                                            </div>

                                            <div className="col-md-4">

                                                <label className="form-label">
                                                    City
                                                </label>

                                                <input
                                                    type="text"
                                                    name="city"
                                                    className="form-control rounded-0"
                                                    value={
                                                        addressForm.city
                                                    }
                                                    onChange={
                                                        handleAddressChange
                                                    }
                                                    required
                                                />

                                            </div>

                                            <div className="col-md-4">

                                                <label className="form-label">
                                                    State
                                                </label>

                                                <input
                                                    type="text"
                                                    name="state"
                                                    className="form-control rounded-0"
                                                    value={
                                                        addressForm.state
                                                    }
                                                    onChange={
                                                        handleAddressChange
                                                    }
                                                    required
                                                />

                                            </div>

                                            <div className="col-md-4">

                                                <label className="form-label">
                                                    Pincode
                                                </label>

                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    className="form-control rounded-0"
                                                    value={
                                                        addressForm.pincode
                                                    }
                                                    onChange={
                                                        handleAddressChange
                                                    }
                                                    maxLength="6"
                                                    pattern="[0-9]{6}"
                                                    required
                                                />

                                            </div>

                                            <div className="col-md-6">

                                                <label className="form-label">
                                                    Address Type
                                                </label>

                                                <select
                                                    name="addressType"
                                                    className="form-select rounded-0"
                                                    value={
                                                        addressForm.addressType
                                                    }
                                                    onChange={
                                                        handleAddressChange
                                                    }
                                                >

                                                    <option value="Home">
                                                        Home
                                                    </option>

                                                    <option value="Work">
                                                        Work
                                                    </option>

                                                    <option value="Other">
                                                        Other
                                                    </option>

                                                </select>

                                            </div>

                                            <div className="col-12">

                                                <button
                                                    type="submit"
                                                    className="btn btn-dark rounded-0 px-4"
                                                    disabled={
                                                        savingAddress
                                                    }
                                                >
                                                    {savingAddress
                                                        ? "SAVING..."
                                                        : "SAVE ADDRESS"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-dark rounded-0 ms-2"
                                                    onClick={() =>
                                                        setShowAddressForm(
                                                            false
                                                        )
                                                    }
                                                >
                                                    CANCEL
                                                </button>

                                            </div>

                                        </div>

                                    </form>
                                )}

                        </div>

                        <div>

                            <div className="border-bottom pb-3 mb-4">

                                <h4 className="fw-bold">
                                    02. PAYMENT METHOD
                                </h4>

                            </div>

                            <label
                                className={
                                    paymentMethod ===
                                    "COD"
                                        ? "border border-dark p-4 d-flex gap-3 mb-3"
                                        : "border p-4 d-flex gap-3 mb-3"
                                }
                                style={{
                                    cursor: "pointer"
                                }}
                            >

                                <input
                                    type="radio"
                                    name="payment"
                                    value="COD"
                                    checked={
                                        paymentMethod ===
                                        "COD"
                                    }
                                    onChange={e =>
                                        setPaymentMethod(
                                            e.target.value
                                        )
                                    }
                                />

                                <div>

                                    <strong>
                                        CASH ON DELIVERY
                                    </strong>

                                    <p className="small text-muted mb-0 mt-1">
                                        Pay when your order
                                        is delivered.
                                    </p>

                                </div>

                            </label>

                            <label
                                className={
                                    paymentMethod ===
                                    "ONLINE"
                                        ? "border border-dark p-4 d-flex gap-3"
                                        : "border p-4 d-flex gap-3"
                                }
                                style={{
                                    cursor: "pointer"
                                }}
                            >

                                <input
                                    type="radio"
                                    name="payment"
                                    value="ONLINE"
                                    checked={
                                        paymentMethod ===
                                        "ONLINE"
                                    }
                                    onChange={e =>
                                        setPaymentMethod(
                                            e.target.value
                                        )
                                    }
                                />

                                <div>

                                    <strong>
                                        ONLINE PAYMENT
                                    </strong>

                                    <p className="small text-muted mb-0 mt-1">
                                        Pay using UPI,
                                        Card, Net Banking
                                        or Wallet through
                                        Razorpay.
                                    </p>

                                </div>

                            </label>

                        </div>

                    </div>

                    <div className="col-lg-5">

                        <div
                            className="border p-4 position-sticky"
                            style={{
                                top: "20px"
                            }}
                        >

                            <div className="d-flex justify-content-between border-bottom pb-3 mb-4">

                                <h4 className="fw-bold mb-0">
                                    ORDER SUMMARY
                                </h4>

                                <span className="small text-muted">
                                    {totalItems} ITEMS
                                </span>

                            </div>

                            {cart.items.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const product =
                                        item.product ||
                                        {};

                                    const price =
                                        getPrice(
                                            product
                                        );

                                    const quantity =
                                        Number(
                                            item.quantity ||
                                            1
                                        );

                                    const itemTotal =
                                        price *
                                        quantity;

                                    const productId =
                                        product._id ||
                                        product.id;

                                    return (
                                        <div
                                            className="d-flex gap-3 mb-4"
                                            key={
                                                item._id ||
                                                index
                                            }
                                        >

                                            <Link
                                                to={`/product/${productId}`}
                                                className="position-relative bg-light flex-shrink-0"
                                                style={{
                                                    width:
                                                        "85px",
                                                    height:
                                                        "105px"
                                                }}
                                            >

                                                {product.images?.[0] ? (
                                                    <img
                                                        src={
                                                            product.images[0]
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                        className="w-100 h-100"
                                                        style={{
                                                            objectFit:
                                                                "cover"
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center small text-muted">
                                                        No Image
                                                    </div>
                                                )}

                                                <span className="position-absolute top-0 end-0 bg-dark text-white px-2 py-1 small">
                                                    {quantity}
                                                </span>

                                            </Link>

                                            <div className="flex-grow-1">

                                                <Link
                                                    to={`/product/${productId}`}
                                                    className="text-dark text-decoration-none fw-semibold d-block"
                                                >
                                                    {
                                                        product.name ||
                                                        "Product"
                                                    }
                                                </Link>

                                                <small className="text-muted d-block">
                                                    Size:{" "}
                                                    {
                                                        item.size ||
                                                        "-"
                                                    }
                                                </small>

                                                <small className="text-muted d-block">
                                                    Color:{" "}
                                                    {
                                                        item.color ||
                                                        "-"
                                                    }
                                                </small>

                                                <strong className="d-block mt-2">
                                                    ₹
                                                    {itemTotal.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                            <hr />

                            <div className="d-flex justify-content-between mb-3">

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    ₹
                                    {subtotal.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>

                            <div className="d-flex justify-content-between mb-3">

                                <span>
                                    Shipping
                                </span>

                                <strong>
                                    {shippingCharge ===
                                    0
                                        ? "FREE"
                                        : `₹${shippingCharge}`}
                                </strong>

                            </div>

                            <div className="d-flex justify-content-between mb-3">

                                <span>
                                    Discount
                                </span>

                                <strong>
                                    ₹0
                                </strong>

                            </div>

                            {subtotal < 999 &&
                                subtotal > 0 && (
                                    <div className="alert alert-light border rounded-0 small">
                                        Add ₹
                                        {(
                                            999 -
                                            subtotal
                                        ).toLocaleString(
                                            "en-IN"
                                        )}{" "}
                                        more for FREE
                                        shipping.
                                    </div>
                                )}

                            <hr />

                            <div className="d-flex justify-content-between align-items-center mb-4">

                                <strong className="fs-5">
                                    TOTAL
                                </strong>

                                <strong className="fs-4">
                                    ₹
                                    {totalAmount.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>

                            <button
                                type="button"
                                className="btn btn-dark rounded-0 w-100 py-3 fw-bold"
                                disabled={
                                    placingOrder ||
                                    !selectedAddress ||
                                    !getUserId()
                                }
                                onClick={
                                    placeOrder
                                }
                            >
                                {placingOrder
                                    ? "PROCESSING..."
                                    : paymentMethod ===
                                      "ONLINE"
                                    ? "CONTINUE TO PAYMENT →"
                                    : "PLACE ORDER →"}
                            </button>

                            <div className="border-top mt-4 pt-4">

                                <div className="d-flex gap-3">

                                    <span>
                                        🔒
                                    </span>

                                    <div>

                                        <strong className="small">
                                            SECURE CHECKOUT
                                        </strong>

                                        <p className="small text-muted mb-0">
                                            Your personal
                                            and payment
                                            information is
                                            protected.
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <Link
                                to="/cart-page"
                                className="d-block text-center text-dark text-decoration-none small mt-4"
                            >
                                ← BACK TO CART
                            </Link>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default Checkout;