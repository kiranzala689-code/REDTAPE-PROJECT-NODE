import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CartPage.css";

const API_URL = "https://redtape-project-node-3.onrender.com";

function CartPage() {
    const navigate = useNavigate();

    const [cart, setCart] = useState({
        items: []
    });

    const [recommendedProducts, setRecommendedProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const getToken = useCallback(() => {
        return localStorage.getItem("token");
    }, []);

    const getGuestId = useCallback(() => {
        let guestId = localStorage.getItem("guestId");

        if (!guestId) {
            guestId =
                "guest_" +
                Date.now() +
                "_" +
                Math.random().toString(36).substring(2, 10);

            localStorage.setItem("guestId", guestId);
        }

        return guestId;
    }, []);

    const getUserIdFromToken = useCallback(() => {
        const token = getToken();

        if (!token) {
            return null;
        }

        try {
            const base64Url = token.split(".")[1];

            const base64 = base64Url
                .replace(/-/g, "+")
                .replace(/_/g, "/");

            const payload = JSON.parse(atob(base64));

            return (
                payload.id ||
                payload._id ||
                payload.userId ||
                payload.user ||
                null
            );
        } catch (error) {
            console.log("TOKEN ERROR:", error.message);
            return null;
        }
    }, [getToken]);

    const getCartConfig = useCallback(() => {
        const token = getToken();
        const userId = getUserIdFromToken();

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

        const guestId = getGuestId();

        return {
            params: {
                guestId
            }
        };
    }, [getToken, getUserIdFromToken, getGuestId]);

    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);

            const userId = getUserIdFromToken();

            let guestId = null;

            if (!userId) {
                guestId = getGuestId();
            }

            console.log("GET CART OWNER:", {
                userId,
                guestId
            });

            const response = await axios.get(
                `${API_URL}/api/cart`,
                getCartConfig()
            );

            console.log("CART RESPONSE:", response.data);

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
                "CART ERROR:",
                error.response?.data || error.message
            );

            setCart({
                items: []
            });
        } finally {
            setLoading(false);
        }
    }, [getUserIdFromToken, getGuestId, getCartConfig]);

    useEffect(() => {
        fetchCart();

        const handleCartUpdate = () => {
            fetchCart();
        };

        window.addEventListener(
            "cartUpdated",
            handleCartUpdate
        );

        return () => {
            window.removeEventListener(
                "cartUpdated",
                handleCartUpdate
            );
        };
    }, [fetchCart]);

    const getPrice = (product) => {
        return Number(
            product?.discountPrice ||
            product?.price ||
            0
        );
    };

    const totalItems =
        cart.items?.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        ) || 0;

    const subtotal =
        cart.items?.reduce(
            (total, item) => {
                const product = item.product || {};

                const price = getPrice(product);

                const quantity =
                    Number(item.quantity || 0);

                return total + price * quantity;
            },
            0
        ) || 0;

    const shippingCharge =
        subtotal >= 999 || subtotal === 0
            ? 0
            : 99;

    const totalAmount =
        subtotal + shippingCharge;

    const getCategories = useCallback(() => {
        const categories = [];

        cart.items?.forEach(item => {
            const category =
                item.product?.category;

            if (
                category &&
                !categories.includes(category)
            ) {
                categories.push(category);
            }
        });

        return categories;
    }, [cart.items]);

    const fetchRecommendedProducts =
        useCallback(async () => {
            try {
                if (
                    !cart.items ||
                    cart.items.length === 0
                ) {
                    setRecommendedProducts({});
                    return;
                }

                const response =
                    await axios.get(
                        `${API_URL}/api/products`
                    );

                const products =
                    response.data?.products ||
                    response.data?.data ||
                    [];

                const cartProductIds =
                    cart.items.map(
                        item =>
                            item.product?._id
                    );

                const categories =
                    getCategories();

                const result = {};

                categories.forEach(category => {
                    result[category] =
                        products
                            .filter(
                                product =>
                                    product.category
                                        ?.toLowerCase() ===
                                    category.toLowerCase()
                            )
                            .filter(
                                product =>
                                    !cartProductIds.includes(
                                        product._id
                                    )
                            )
                            .slice(0, 10);
                });

                setRecommendedProducts(result);
            } catch (error) {
                console.log(
                    "RECOMMENDED ERROR:",
                    error.response?.data ||
                    error.message
                );
            }
        }, [cart.items, getCategories]);

    useEffect(() => {
        fetchRecommendedProducts();
    }, [fetchRecommendedProducts]);

    const updateQuantity = async (
        itemId,
        quantity
    ) => {
        if (quantity < 1) {
            return;
        }

        try {
            setUpdating(true);

            const response =
                await axios.put(
                    `${API_URL}/api/cart/${itemId}`,
                    {
                        quantity
                    },
                    getCartConfig()
                );

            setCart(
                response.data?.cart || {
                    items: []
                }
            );

            window.dispatchEvent(
                new Event("cartUpdated")
            );
        } catch (error) {
            console.log(
                "UPDATE ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Quantity update failed"
            );
        } finally {
            setUpdating(false);
        }
    };

    const removeItem = async itemId => {
        try {
            setUpdating(true);

            const response =
                await axios.delete(
                    `${API_URL}/api/cart/${itemId}`,
                    getCartConfig()
                );

            setCart(
                response.data?.cart || {
                    items: []
                }
            );

            window.dispatchEvent(
                new Event("cartUpdated")
            );
        } catch (error) {
            console.log(
                "REMOVE ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Product remove nahi hua"
            );
        } finally {
            setUpdating(false);
        }
    };

    const slideProducts = (
        category,
        direction
    ) => {
        const slider =
            document.getElementById(
                `recommended-${category}`
            );

        if (!slider) {
            return;
        }

        slider.scrollBy({
            left:
                direction === "next"
                    ? 900
                    : -900,
            behavior: "smooth"
        });
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
                        Loading cart...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page bg-white">
            <div className="container py-4 py-lg-5">
                <div className="row g-5">
                    <div className="col-lg-8">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h1 className="fw-bold mb-1">
                                    SHOPPING BAG
                                </h1>

                                <p className="text-muted mb-0">
                                    {totalItems}{" "}
                                    {totalItems === 1
                                        ? "ITEM"
                                        : "ITEMS"}
                                </p>
                            </div>

                            <Link
                                to="/"
                                className="btn btn-outline-dark rounded-0 px-4"
                            >
                                CONTINUE SHOPPING
                            </Link>
                        </div>

                        <hr />

                        {cart.items?.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="display-3 mb-3">
                                    🛒
                                </div>

                                <h4 className="fw-bold">
                                    YOUR BAG IS EMPTY
                                </h4>

                                <p className="text-muted">
                                    Add some products to
                                    your shopping bag.
                                </p>

                                <Link
                                    to="/"
                                    className="btn btn-dark rounded-0 px-5 py-3"
                                >
                                    START SHOPPING
                                </Link>
                            </div>
                        ) : (
                            cart.items.map(item => {
                                const product =
                                    item.product || {};

                                const price =
                                    getPrice(product);

                                const quantity =
                                    Number(
                                        item.quantity || 0
                                    );

                                const itemTotal =
                                    price * quantity;

                                return (
                                    <div
                                        className="border-bottom py-4"
                                        key={item._id}
                                    >
                                        <div className="row g-3 align-items-center">
                                            <div className="col-4 col-md-3">
                                                <Link
                                                    to={`/product/${product._id}`}
                                                    className="d-block bg-light"
                                                >
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={
                                                                product.images[0]
                                                            }
                                                            alt={
                                                                product.name
                                                            }
                                                            className="img-fluid w-100"
                                                            style={{
                                                                aspectRatio:
                                                                    "0.8",
                                                                objectFit:
                                                                    "cover"
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="d-flex align-items-center justify-content-center text-muted"
                                                            style={{
                                                                aspectRatio:
                                                                    "0.8"
                                                            }}
                                                        >
                                                            No Image
                                                        </div>
                                                    )}
                                                </Link>
                                            </div>

                                            <div className="col-8 col-md-5">
                                                <Link
                                                    to={`/product/${product._id}`}
                                                    className="text-dark text-decoration-none fw-bold"
                                                >
                                                    {product.name ||
                                                        "Product"}
                                                </Link>

                                                {product.brand && (
                                                    <p className="small text-muted mb-1 mt-2">
                                                        {
                                                            product.brand
                                                        }
                                                    </p>
                                                )}

                                                <p className="small text-muted mb-1">
                                                    Size:{" "}
                                                    <strong className="text-dark">
                                                        {item.size ||
                                                            "-"}
                                                    </strong>
                                                </p>

                                                <p className="small text-muted mb-2">
                                                    Color:{" "}
                                                    <strong className="text-dark">
                                                        {item.color ||
                                                            "-"}
                                                    </strong>
                                                </p>

                                                <strong>
                                                    ₹
                                                    {price.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>

                                                <button
                                                    type="button"
                                                    className="btn btn-link text-danger text-decoration-none p-0 d-block d-md-none mt-2"
                                                    disabled={
                                                        updating
                                                    }
                                                    onClick={() =>
                                                        removeItem(
                                                            item._id
                                                        )
                                                    }
                                                >
                                                    REMOVE
                                                </button>
                                            </div>

                                            <div className="col-6 col-md-2">
                                                <div className="border d-flex align-items-center justify-content-between">
                                                    <button
                                                        type="button"
                                                        className="btn btn-light rounded-0"
                                                        disabled={
                                                            updating ||
                                                            quantity <=
                                                            1
                                                        }
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item._id,
                                                                quantity -
                                                                1
                                                            )
                                                        }
                                                    >
                                                        −
                                                    </button>

                                                    <span className="fw-bold px-2">
                                                        {
                                                            quantity
                                                        }
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className="btn btn-light rounded-0"
                                                        disabled={
                                                            updating ||
                                                            quantity >=
                                                            Number(
                                                                product.stock ||
                                                                0
                                                            )
                                                        }
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item._id,
                                                                quantity +
                                                                1
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="col-6 col-md-2 text-end">
                                                <strong>
                                                    ₹
                                                    {itemTotal.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>

                                                <button
                                                    type="button"
                                                    className="btn btn-link text-dark text-decoration-underline p-0 d-none d-md-block ms-auto mt-2 small"
                                                    disabled={
                                                        updating
                                                    }
                                                    onClick={() =>
                                                        removeItem(
                                                            item._id
                                                        )
                                                    }
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {cart.items?.length > 0 && (
                        <div className="col-lg-4">
                            <div
                                className="border p-4 position-sticky"
                                style={{
                                    top: "20px"
                                }}
                            >
                                <h5 className="fw-bold mb-4">
                                    ORDER SUMMARY
                                </h5>

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

                                <div className="d-flex justify-content-between mb-4">
                                    <strong>
                                        TOTAL
                                    </strong>

                                    <strong className="fs-5">
                                        ₹
                                        {totalAmount.toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-dark rounded-0 w-100 py-3 fw-bold"
                                    onClick={() =>
                                        navigate(
                                            "/checkout"
                                        )
                                    }
                                >
                                    PROCEED TO CHECKOUT
                                </button>

                                <div className="border-top mt-4 pt-4">
                                    <div className="d-flex gap-3 mb-3">
                                        <span>
                                            🔒
                                        </span>

                                        <div>
                                            <strong className="small">
                                                SECURE CHECKOUT
                                            </strong>

                                            <p className="small text-muted mb-0">
                                                Your payment
                                                information is
                                                protected.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-3">
                                        <span>
                                            🚚
                                        </span>

                                        <div>
                                            <strong className="small">
                                                FREE SHIPPING
                                            </strong>

                                            <p className="small text-muted mb-0">
                                                On orders above
                                                ₹999
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {Object.entries(
                    recommendedProducts
                ).map(
                    ([category, products]) => {
                        if (
                            !products ||
                            products.length === 0
                        ) {
                            return null;
                        }

                        return (
                            <section
                                className="mt-5 pt-4"
                                key={category}
                            >
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                                    <h3 className="fw-bold mb-0">
                                        YOU MAY ALSO LIKE
                                    </h3>

                                    <Link
                                        to={`/${category}`}
                                        className="text-dark text-decoration-none fw-semibold"
                                    >
                                        VIEW ALL →
                                    </Link>
                                </div>

                                <div className="position-relative">
                                    <button
                                        type="button"
                                        className="btn btn-light border position-absolute top-50 start-0 translate-middle-y rounded-circle"
                                        style={{
                                            zIndex: 2
                                        }}
                                        onClick={() =>
                                            slideProducts(
                                                category,
                                                "prev"
                                            )
                                        }
                                    >
                                        ‹
                                    </button>

                                    <div
                                        id={`recommended-${category}`}
                                        className="d-flex gap-3 overflow-hidden px-5"
                                    >
                                        {products.map(
                                            product => {
                                                const price =
                                                    getPrice(
                                                        product
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            product._id
                                                        }
                                                        className="border flex-shrink-0"
                                                        style={{
                                                            width:
                                                                "220px"
                                                        }}
                                                    >
                                                        <Link
                                                            to={`/product/${product._id}`}
                                                            className="d-block bg-light"
                                                        >
                                                            {product.images?.[0] ? (
                                                                <img
                                                                    src={
                                                                        product
                                                                            .images[0]
                                                                    }
                                                                    alt={
                                                                        product.name
                                                                    }
                                                                    className="w-100"
                                                                    style={{
                                                                        height:
                                                                            "270px",
                                                                        objectFit:
                                                                            "cover"
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="d-flex align-items-center justify-content-center"
                                                                    style={{
                                                                        height:
                                                                            "270px"
                                                                    }}
                                                                >
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </Link>

                                                        <div className="p-3">
                                                            <Link
                                                                to={`/product/${product._id}`}
                                                                className="text-dark text-decoration-none fw-semibold"
                                                            >
                                                                {
                                                                    product.name
                                                                }
                                                            </Link>

                                                            <div className="mt-2">
                                                                <strong>
                                                                    ₹
                                                                    {price.toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </strong>

                                                                {product.discountPrice &&
                                                                    Number(
                                                                        product.discountPrice
                                                                    ) <
                                                                    Number(
                                                                        product.price
                                                                    ) && (
                                                                        <span className="text-muted text-decoration-line-through ms-2 small">
                                                                            ₹
                                                                            {Number(
                                                                                product.price
                                                                            ).toLocaleString(
                                                                                "en-IN"
                                                                            )}
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-light border position-absolute top-50 end-0 translate-middle-y rounded-circle"
                                        style={{
                                            zIndex: 2
                                        }}
                                        onClick={() =>
                                            slideProducts(
                                                category,
                                                "next"
                                            )
                                        }
                                    >
                                        ›
                                    </button>
                                </div>
                            </section>
                        );
                    }
                )}
            </div>
        </div>
    );
}

export default CartPage;