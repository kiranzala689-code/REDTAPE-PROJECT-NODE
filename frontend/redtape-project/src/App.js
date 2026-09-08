import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./components/pages/Home";
import Category from "./components/pages/Category";
import ProductDetail from "./components/pages/ProductDetail";
import Cart from "./components/pages/Cart";
import CartPage from "./components/pages/CartPage";

import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import ForgotPassword from "./components/pages/ForgotPassword";

import Checkout from "./components/pages/Checkout";
import Payment from "./components/pages/Payment";

import "./components/pages/Home.css";
import "./components/pages/ForgotPassword.css";
import MyOrders from "./components/pages/MyOrders";
import OrderDetails from "./components/pages/OrderDetails";
import UserAccount from "./components/pages/UserAccount";

function App() {
    const [isCartOpen, setIsCartOpen] =
        useState(false);

    return (
        <BrowserRouter>

            <Navbar
                onCartClick={() =>
                    setIsCartOpen(true)
                }
            />

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/category/:category"
                    element={<Category />}
                />

                <Route
                    path="/:category/:id"
                    element={<ProductDetail />}
                />

                <Route
                    path="/product/:id"
                    element={<ProductDetail />}
                />

                <Route
                    path="/cart"
                    element={<CartPage />}
                />

                <Route
                    path="/cart-page"
                    element={<CartPage />}
                />

                <Route
                    path="/checkout"
                    element={<Checkout />}
                />

                <Route
                    path="/payment/:orderId"
                    element={<Payment />}
                />

                 <Route
                    path="/orders/:id"
                    element={<OrderDetails />}
                /> 

                <Route
                    path="/orders"
                    element={<MyOrders/>}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />
<Route path="/account" element={<UserAccount/>} />
            </Routes>

            <Footer />

            <Cart
                isOpen={isCartOpen}
                onClose={() =>
                    setIsCartOpen(false)
                }
            />

        </BrowserRouter>
    );
}

export default App;