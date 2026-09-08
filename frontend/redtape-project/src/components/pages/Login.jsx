import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const mergeGuestCart = async (token, guestId) => {
        if (!token || !guestId) {
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/api/cart/merge",
                {
                    guestId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("GUEST CART MERGE:", response.data);

            localStorage.removeItem("guestId");
        } catch (error) {
            console.log(
                "MERGE CART ERROR:",
                error.response?.data || error.message
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            alert("Please enter email and password");
            return;
        }

        try {
            setLoading(true);

            const guestId = localStorage.getItem("guestId");

            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email: formData.email.trim(),
                    password: formData.password
                }
            );

            console.log("LOGIN RESPONSE:", response.data);

            const token = response.data?.token;
            const user = response.data?.user;

            if (!token || !user) {
                alert("Login response is invalid");
                return;
            }

            localStorage.setItem("token", token);

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            localStorage.setItem(
                "userId",
                user.id
            );

            console.log("LOGIN USER ID:", user.id);
            console.log("LOGIN USER:", user);

            if (guestId) {
                await mergeGuestCart(
                    token,
                    guestId
                );
            }

            window.dispatchEvent(
                new Event("authChanged")
            );

            window.dispatchEvent(
                new Event("cartUpdated")
            );

            alert("Login successful");

            navigate("/account");
        } catch (error) {
            console.log(
                "LOGIN ERROR:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Invalid email or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="container-fluid px-0">

                <div className="row g-0 min-vh-100">

                    <div className="col-lg-6 login-left">

                        <div className="login-brand">
                            REDTAPE
                        </div>

                        <div className="login-left-content">

                            <p className="login-small-text">
                                STYLE THAT DEFINES YOU
                            </p>

                            <h1>
                                STEP INTO
                                <br />
                                YOUR STYLE
                            </h1>

                            <p>
                                Discover premium fashion,
                                footwear and accessories
                                designed for your everyday
                                statement.
                            </p>

                            <div className="login-features">

                                <div>
                                    <span>01</span>
                                    <p>
                                        Premium Quality
                                    </p>
                                </div>

                                <div>
                                    <span>02</span>
                                    <p>
                                        Latest Collections
                                    </p>
                                </div>

                                <div>
                                    <span>03</span>
                                    <p>
                                        Easy & Secure Shopping
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="col-lg-6 login-right">

                        <div className="login-box">

                            <div className="text-center mb-5">

                                <h2>
                                    WELCOME BACK
                                </h2>

                                <p>
                                    Login to your REDTAPE
                                    account
                                </p>

                            </div>

                            <form onSubmit={handleSubmit}>

                                <div className="mb-4">

                                    <label
                                        className="form-label"
                                        htmlFor="email"
                                    >
                                        EMAIL ADDRESS
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className="form-control login-input"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        required
                                    />

                                </div>

                                <div className="mb-3">

                                    <div className="d-flex justify-content-between">

                                        <label
                                            className="form-label"
                                            htmlFor="password"
                                        >
                                            PASSWORD
                                        </label>

                                        <Link
                                            to="/forgot-password"
                                            className="forgot-link"
                                        >
                                            Forgot Password?
                                        </Link>

                                    </div>

                                    <div className="password-wrapper">

                                        <input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            className="form-control login-input"
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoComplete="current-password"
                                            required
                                        />

                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() =>
                                                setShowPassword(
                                                    previous =>
                                                        !previous
                                                )
                                            }
                                        >
                                            {showPassword
                                                ? "HIDE"
                                                : "SHOW"}
                                        </button>

                                    </div>

                                </div>

                                <div className="form-check mb-4">

                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="remember"
                                    />

                                    <label
                                        className="form-check-label"
                                        htmlFor="remember"
                                    >
                                        Remember me
                                    </label>

                                </div>

                                <button
                                    type="submit"
                                    className="login-button"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "LOGGING IN..."
                                        : "LOGIN"}
                                </button>

                            </form>

                            <div className="login-divider">
                                <span>
                                    OR
                                </span>
                            </div>

                            <div className="register-text">

                                <span>
                                    Don't have an account?
                                </span>

                                <Link to="/register">
                                    CREATE ACCOUNT
                                </Link>

                            </div>

                            <div className="login-bottom">

                                <Link to="/">
                                    ← CONTINUE SHOPPING
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;