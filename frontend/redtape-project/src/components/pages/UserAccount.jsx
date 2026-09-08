import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserAccount.css";

function UserAccount() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] =
        useState("account");

    const [address, setAddress] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    useEffect(() => {
        const savedUser =
            localStorage.getItem("user");

        const token =
            localStorage.getItem("token");

        if (!savedUser || !token) {
            navigate("/login");
            return;
        }

        try {
            const userData =
                JSON.parse(savedUser);

            setUser(userData);

            const savedAddress =
                localStorage.getItem(
                    `address_${userData.id}`
                );

            if (savedAddress) {
                setAddress(
                    JSON.parse(savedAddress)
                );
            }
        } catch (error) {
            localStorage.removeItem("user");
            localStorage.removeItem("userId");
            localStorage.removeItem("token");

            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");

        window.dispatchEvent(
            new Event("authChanged")
        );

        navigate("/login");
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;

        setAddress((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const saveAddress = () => {
        if (!user) {
            return;
        }

        localStorage.setItem(
            `address_${user.id}`,
            JSON.stringify(address)
        );

        alert("Address saved successfully");
    };

    if (!user) {
        return null;
    }

    return (
        <div className="user-account-page">

            <div className="account-header">

                <div>
                    <p className="account-label">
                        MY ACCOUNT
                    </p>

                    <h1>
                        Welcome, {user.name || "User"}
                    </h1>

                    <p className="account-subtitle">
                        Manage your account, orders and
                        personal information
                    </p>
                </div>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    LOGOUT
                </button>

            </div>

            <div className="account-container">

                <div className="account-sidebar">

                    <div className="profile-box">

                        <div className="profile-circle">
                            {(user.name || "U")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <h3>
                            {user.name || "User"}
                        </h3>

                        <p>
                            {user.email || ""}
                        </p>

                    </div>

                    <div className="account-menu">

                        <button
                            className={
                                activeSection === "account"
                                    ? "account-menu-item active"
                                    : "account-menu-item"
                            }
                            onClick={() =>
                                setActiveSection(
                                    "account"
                                )
                            }
                        >
                            <span>01</span>
                            Account Details
                        </button>

                        <button
                            className="account-menu-item"
                            onClick={() =>
                                navigate("/orders")
                            }
                        >
                            <span>02</span>
                            My Orders
                        </button>

                        <button
                            className={
                                activeSection === "address"
                                    ? "account-menu-item active"
                                    : "account-menu-item"
                            }
                            onClick={() =>
                                setActiveSection(
                                    "address"
                                )
                            }
                        >
                            <span>03</span>
                            My Address
                        </button>

                        <button
                            className="account-menu-item"
                            onClick={() =>
                                navigate("/wishlist")
                            }
                        >
                            <span>04</span>
                            Wishlist
                        </button>

                    </div>

                </div>

                <div className="account-content">

                    {activeSection === "account" && (
                        <>
                            <div className="content-title">

                                <p>
                                    PERSONAL INFORMATION
                                </p>

                                <h2>
                                    Account Details
                                </h2>

                            </div>

                            <div className="details-grid">

                                <div className="detail-card">

                                    <span>
                                        FULL NAME
                                    </span>

                                    <h4>
                                        {user.name ||
                                            "Not Available"}
                                    </h4>

                                </div>

                                <div className="detail-card">

                                    <span>
                                        EMAIL ADDRESS
                                    </span>

                                    <h4>
                                        {user.email ||
                                            "Not Available"}
                                    </h4>

                                </div>

                                <div className="detail-card">

                                    <span>
                                        USER ID
                                    </span>

                                    <h4>
                                        {user.id ||
                                            "Not Available"}
                                    </h4>

                                </div>

                                <div className="detail-card">

                                    <span>
                                        ACCOUNT STATUS
                                    </span>

                                    <h4 className="active-status">
                                        ACTIVE
                                    </h4>

                                </div>

                            </div>

                            <div className="account-actions">

                                <Link
                                    to="/"
                                    className="account-action-button"
                                >
                                    CONTINUE SHOPPING
                                </Link>

                                <Link
                                    to="/orders"
                                    className="account-action-button"
                                >
                                    MY ORDERS
                                </Link>

                                <Link
                                    to="/cart"
                                    className="account-action-button dark"
                                >
                                    VIEW CART
                                </Link>

                            </div>

                            <div className="security-box">

                                <div>

                                    <p>
                                        ACCOUNT SECURITY
                                    </p>

                                    <h3>
                                        Your account is secure
                                    </h3>

                                    <span>
                                        Your login session is
                                        currently active.
                                    </span>

                                </div>

                                <button
                                    onClick={
                                        handleLogout
                                    }
                                >
                                    SIGN OUT
                                </button>

                            </div>
                        </>
                    )}

                    {activeSection === "address" && (
                        <>
                            <div className="content-title">

                                <p>
                                    DELIVERY INFORMATION
                                </p>

                                <h2>
                                    My Address
                                </h2>

                            </div>

                            <div className="address-form">

                                <div className="address-row">

                                    <div className="address-field">

                                        <label>
                                            FULL NAME
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                address.name
                                            }
                                            onChange={
                                                handleAddressChange
                                            }
                                            placeholder="Enter full name"
                                        />

                                    </div>

                                    <div className="address-field">

                                        <label>
                                            PHONE NUMBER
                                        </label>

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={
                                                address.phone
                                            }
                                            onChange={
                                                handleAddressChange
                                            }
                                            placeholder="Enter phone number"
                                        />

                                    </div>

                                </div>

                                <div className="address-field">

                                    <label>
                                        ADDRESS
                                    </label>

                                    <textarea
                                        name="address"
                                        value={
                                            address.address
                                        }
                                        onChange={
                                            handleAddressChange
                                        }
                                        placeholder="Enter your complete address"
                                        rows="4"
                                    />

                                </div>

                                <div className="address-row">

                                    <div className="address-field">

                                        <label>
                                            CITY
                                        </label>

                                        <input
                                            type="text"
                                            name="city"
                                            value={
                                                address.city
                                            }
                                            onChange={
                                                handleAddressChange
                                            }
                                            placeholder="Enter city"
                                        />

                                    </div>

                                    <div className="address-field">

                                        <label>
                                            STATE
                                        </label>

                                        <input
                                            type="text"
                                            name="state"
                                            value={
                                                address.state
                                            }
                                            onChange={
                                                handleAddressChange
                                            }
                                            placeholder="Enter state"
                                        />

                                    </div>

                                </div>

                                <div className="address-field">

                                    <label>
                                        PINCODE
                                    </label>

                                    <input
                                        type="text"
                                        name="pincode"
                                        value={
                                            address.pincode
                                        }
                                        onChange={
                                            handleAddressChange
                                        }
                                        placeholder="Enter pincode"
                                    />

                                </div>

                                <button
                                    className="save-address-button"
                                    onClick={saveAddress}
                                >
                                    SAVE ADDRESS
                                </button>

                            </div>
                        </>
                    )}

                </div>

            </div>

        </div>
    );
}

export default UserAccount;