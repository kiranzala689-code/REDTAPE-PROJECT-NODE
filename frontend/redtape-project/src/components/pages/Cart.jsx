import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart({ isOpen, onClose }) {
  const navigate = useNavigate();

  const [cart, setCart] = useState({
    items: []
  });

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const getGuestId = () => {
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
  };

  const fetchCart = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("userId");
      const guestId = localStorage.getItem("guestId");

      if (!userId && !guestId) {
        setCart({ items: [] });
        return;
      }

      let response;

      if (userId) {
        response = await axios.get(
          `http://localhost:5000/api/cart?userId=${userId}`
        );
      } else {
        response = await axios.get(
          `http://localhost:5000/api/cart?guestId=${guestId}`
        );
      }

      setCart(
        response.data?.cart || {
          items: []
        }
      );
    } catch (error) {
      console.log("CART ERROR:", error);

      setCart({
        items: []
      });
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
  }, []);

  const getPrice = (product) => {
    return Number(
      product?.discountPrice ||
        product?.price ||
        0
    );
  };

  const totalAmount =
    cart.items?.reduce(
      (total, item) =>
        total +
        getPrice(item.product) *
          Number(item.quantity || 0),
      0
    ) || 0;

  const totalItems =
    cart.items?.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    ) || 0;

  const updateQuantity = async (
    itemId,
    quantity
  ) => {
    if (quantity < 1) {
      return;
    }

    try {
      setUpdating(true);

      const userId =
        localStorage.getItem("userId");

      const guestId =
        localStorage.getItem("guestId");

      let url = `http://localhost:5000/api/cart/${itemId}`;

      if (userId) {
        url += `?userId=${userId}`;
      } else if (guestId) {
        url += `?guestId=${guestId}`;
      }

      const response = await axios.put(
        url,
        {
          quantity
        }
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
        "UPDATE CART ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Quantity update failed"
      );
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdating(true);

      const userId =
        localStorage.getItem("userId");

      const guestId =
        localStorage.getItem("guestId");

      let url = `http://localhost:5000/api/cart/${itemId}`;

      if (userId) {
        url += `?userId=${userId}`;
      } else if (guestId) {
        url += `?guestId=${guestId}`;
      }

      const response = await axios.delete(url);

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
        "REMOVE CART ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Product remove nahi hua"
      );
    } finally {
      setUpdating(false);
    }
  };

  const viewCart = () => {
    onClose();
    navigate("/cart-page");
  };

  const buyNow = () => {
    if (!cart.items?.length) {
      return;
    }

    onClose();
    navigate("/checkout");
  };

  return (
    <>
      <div
        className={`cart-overlay ${
          isOpen ? "show" : ""
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`cart-drawer ${
          isOpen ? "open" : ""
        }`}
      >

        {/* HEADER */}

        <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-3">

          <h5 className="mb-0 fw-semibold">
            Your cart ({totalItems})
          </h5>

          <button
            type="button"
            className="btn btn-link text-dark text-decoration-none fs-3 p-0"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        {/* BODY */}

        <div className="cart-body flex-grow-1 overflow-auto px-3 py-3">

          {loading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border"
                role="status"
              ></div>

              <p className="mt-3 text-muted">
                Loading cart...
              </p>

            </div>

          ) : cart.items?.length === 0 ? (

            <div className="text-center py-5">

              <i className="bi bi-bag fs-1"></i>

              <h5 className="mt-3">
                Your cart is empty
              </h5>

              <p className="text-muted">
                Add some products to your cart.
              </p>

              <Link
                to="/"
                onClick={onClose}
                className="btn btn-dark px-4"
              >
                SHOP NOW
              </Link>

            </div>

          ) : (

            cart.items.map((item) => {

              const product = item.product;

              const price =
                getPrice(product);

              const itemTotal =
                price *
                Number(item.quantity || 0);

              return (
                <div
                  key={item._id}
                  className="d-flex gap-3 border-bottom pb-3 mb-3"
                >

                  {/* IMAGE */}

                  <div
                    className="flex-shrink-0"
                    style={{
                      width: "85px",
                      height: "105px"
                    }}
                  >

                    <Link
                      to={`/product/${product?._id}`}
                      onClick={onClose}
                    >

                      {product?.images?.[0] ? (

                        <img
                          src={
                            product.images[0]
                          }
                          alt={
                            product.name
                          }
                          className="w-100 h-100 rounded"
                          style={{
                            objectFit:
                              "contain",
                            background:
                              "#f5f5f5"
                          }}
                        />

                      ) : (

                        <div
                          className="w-100 h-100 bg-light d-flex align-items-center justify-content-center small"
                        >
                          No Image
                        </div>

                      )}

                    </Link>

                  </div>

                  {/* PRODUCT INFO */}

                  <div className="flex-grow-1">

                    <div className="d-flex justify-content-between gap-2">

                      <Link
                        to={`/product/${product?._id}`}
                        onClick={onClose}
                        className="text-dark text-decoration-none small fw-semibold"
                      >
                        {product?.name}
                      </Link>

                      <button
                        type="button"
                        className="btn btn-link text-dark text-decoration-none p-0 fs-5"
                        disabled={updating}
                        onClick={() =>
                          removeItem(
                            item._id
                          )
                        }
                      >
                        ×
                      </button>

                    </div>

                    <p className="text-muted small mb-2">

                      Size:{" "}
                      <strong>
                        {item.size}
                      </strong>

                      {item.color && (
                        <>
                          {" | "}
                          Color:{" "}
                          <strong>
                            {item.color}
                          </strong>
                        </>
                      )}

                    </p>

                    <div className="d-flex justify-content-between align-items-center">

                      {/* QUANTITY */}

                      <div className="d-flex align-items-center border rounded-pill">

                        <button
                          type="button"
                          className="btn btn-sm border-0 px-2"
                          disabled={
                            updating ||
                            item.quantity <=
                              1
                          }
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.quantity - 1
                            )
                          }
                        >
                          −
                        </button>

                        <span className="px-2 small fw-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          className="btn btn-sm border-0 px-2"
                          disabled={
                            updating ||
                            item.quantity >=
                              product?.stock
                          }
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                      {/* PRICE */}

                      <strong className="small">
                        ₹
                        {itemTotal.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                  </div>

                </div>
              );
            })

          )}

        </div>

        {/* FOOTER */}

        {cart.items?.length > 0 && (

          <div className="border-top bg-white p-3">

            <div className="d-flex justify-content-between align-items-center">

              <span className="fw-semibold">
                Estimated total
              </span>

              <strong>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <p className="small text-muted mb-3 mt-1">
              Tax included and shipping
              calculated at checkout
            </p>

            <div className="row g-2">

              <div className="col-4">

                <button
                  type="button"
                  className="btn btn-light w-100 rounded-pill"
                  onClick={viewCart}
                >
                  View
                </button>

              </div>

              <div className="col-8">

                <button
                  type="button"
                  className="btn btn-dark w-100 rounded-pill"
                  onClick={buyNow}
                >
                  BUY NOW
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </>
  );
}

export default Cart;