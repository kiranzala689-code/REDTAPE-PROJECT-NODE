import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const API_URL = "https://redtape-project-node-4.onrender.com";

function Cart({ isOpen, onClose }) {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        try {
            setLoading(true);

            const userId = localStorage.getItem("userId");
            const guestId = localStorage.getItem("guestId");

            if (!userId && !guestId) {
                setCartItems([]);
                return;
            }

            const query = userId
                ? `userId=${userId}`
                : `guestId=${guestId}`;

            const res = await fetch(`${API_URL}/api/cart?${query}`);

            if (!res.ok) {
                throw new Error("Failed to fetch cart");
            }

            const data = await res.json();

            setCartItems(
                Array.isArray(data)
                    ? data
                    : data.cart || data.items || []
            );
        } catch (error) {
            console.error("Cart fetch error:", error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCart();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleCartUpdate = () => {
            if (isOpen) {
                fetchCart();
            }
        };

        window.addEventListener("cartUpdated", handleCartUpdate);

        return () => {
            window.removeEventListener("cartUpdated", handleCartUpdate);
        };
    }, [isOpen]);

    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) return;

        try {
            const userId = localStorage.getItem("userId");
            const guestId = localStorage.getItem("guestId");

            const query = userId
                ? `userId=${userId}`
                : `guestId=${guestId}`;

            const res = await fetch(
                `${API_URL}/api/cart/${itemId}?${query}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ quantity }),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to update quantity");
            }

            fetchCart();

            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.error("Quantity update error:", error);
        }
    };

    const removeItem = async (itemId) => {
        try {
            const userId = localStorage.getItem("userId");
            const guestId = localStorage.getItem("guestId");

            const query = userId
                ? `userId=${userId}`
                : `guestId=${guestId}`;

            const res = await fetch(
                `${API_URL}/api/cart/${itemId}?${query}`,
                {
                    method: "DELETE",
                }
            );

            if (!res.ok) {
                throw new Error("Failed to remove item");
            }

            fetchCart();

            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.error("Remove item error:", error);
        }
    };

    const getProductId = (item) => {
        return (
            item.productId?._id ||
            item.productId ||
            item.product?._id ||
            item.product?._id
        );
    };

    const getProductName = (item) => {
        return (
            item.productId?.name ||
            item.product?.name ||
            item.name ||
            "Product"
        );
    };

    const getProductImage = (item) => {
        return (
            item.productId?.images?.[0] ||
            item.productId?.image ||
            item.product?.images?.[0] ||
            item.product?.image ||
            item.image ||
            ""
        );
    };

    const getProductPrice = (item) => {
        return (
            item.productId?.salePrice ||
            item.productId?.price ||
            item.product?.salePrice ||
            item.product?.price ||
            item.price ||
            0
        );
    };

    const getQuantity = (item) => {
        return item.quantity || 1;
    };

    const totalPrice = cartItems.reduce((total, item) => {
        return total + getProductPrice(item) * getQuantity(item);
    }, 0);

    const viewCart = () => {
        onClose();
        navigate("/cart-page");
    };

    const buyNow = () => {
        onClose();
        navigate("/checkout");
    };

    return (
        <>
            <div
                className={`cart-overlay ${isOpen ? "show" : ""}`}
                onClick={onClose}
            ></div>

            <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
                <div className="cart-header">
                    <h2>Your Cart</h2>

                    <button
                        className="cart-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="cart-content">
                    {loading ? (
                        <div className="cart-loading">
                            Loading...
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <h3>Your cart is empty</h3>
                            <p>Add some products to your cart.</p>
                        </div>
                    ) : (
                        cartItems.map((item) => {
                            const productId = getProductId(item);
                            const name = getProductName(item);
                            const image = getProductImage(item);
                            const price = getProductPrice(item);
                            const quantity = getQuantity(item);

                            return (
                                <div
                                    className="cart-item"
                                    key={item._id}
                                >
                                    <div
                                        className="cart-item-image"
                                        onClick={() => {
                                            onClose();
                                            navigate(
                                                `/product/${productId}`
                                            );
                                        }}
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
                                    </div>

                                    <div className="cart-item-details">
                                        <h3
                                            onClick={() => {
                                                onClose();
                                                navigate(
                                                    `/product/${productId}`
                                                );
                                            }}
                                        >
                                            {name}
                                        </h3>

                                        <p className="cart-item-price">
                                            ₹{price}
                                        </p>

                                        <div className="cart-quantity">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item._id,
                                                        quantity - 1
                                                    )
                                                }
                                            >
                                                −
                                            </button>

                                            <span>{quantity}</span>

                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item._id,
                                                        quantity + 1
                                                    )
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        className="cart-remove"
                                        onClick={() =>
                                            removeItem(item._id)
                                        }
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <strong>₹{totalPrice}</strong>
                        </div>

                        <button
                            className="view-cart-btn"
                            onClick={viewCart}
                        >
                            View Cart
                        </button>

                        <button
                            className="buy-now-btn"
                            onClick={buyNow}
                        >
                            Buy Now
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default Cart;