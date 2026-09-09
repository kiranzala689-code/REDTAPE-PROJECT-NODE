import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const API_URL = "https://redtape-project-node-3.onrender.com";

const categories = [
    "shirt",
    "tshirt",
    "shoes",
    "polo-shirt",
    "pent",
    "cargo-pent",
    "jackets",
    "hoodies",
    "watch",
    "perfume",
    "footwear",
    "backpack"
];

const categoryNames = {
    shirt: "Shirts",
    tshirt: "T-Shirts",
    shoes: "Shoes",
    "polo-shirt": "Polo Shirts",
    pent: "Pants",
    "cargo-pent": "Cargo Pants",
    jackets: "Jackets",
    hoodies: "Hoodies",
    watch: "Watches",
    perfume: "Perfumes",
    footwear: "Footwear",
    backpack: "Backpacks"
};

function getDatabaseId(product) {
    if (product?._id?.$oid) {
        return String(product._id.$oid);
    }

    if (typeof product?._id === "string") {
        return product._id;
    }

    return null;
}

function getProductImage(product) {
    if (product?.image) {
        return product.image;
    }

    if (product?.img) {
        return product.img;
    }

    if (product?.image1) {
        return product.image1;
    }

    if (
        Array.isArray(product?.images) &&
        product.images.length > 0
    ) {
        return product.images[0];
    }

    return "https://via.placeholder.com/100x120?text=Product";
}

function getProductName(product) {
    return (
        product?.name ||
        product?.title ||
        product?.productName ||
        product?.product_name ||
        "Product"
    );
}

function getProductPrice(product) {
    return Number(
        product?.discountPrice ||
        product?.salePrice ||
        product?.sellingPrice ||
        product?.price ||
        0
    );
}

function SearchBox({
    search,
    setSearch,
    products,
    mobile,
    setShowSuggestions,
    showSuggestions,
    searchRef,
    handleSearchSubmit,
    handleProductClick,
    handleCategoryClick
}) {
    const searchText = search.toLowerCase().trim();

    const filteredProducts = products
        .filter((product) => {
            if (!searchText) {
                return false;
            }

            const name =
                getProductName(product).toLowerCase();

            const category = String(
                product?.category || ""
            ).toLowerCase();

            const subCategory = String(
                product?.subCategory || ""
            ).toLowerCase();

            const brand = String(
                product?.brand || ""
            ).toLowerCase();

            const routeCategory = String(
                product?.routeCategory || ""
            ).toLowerCase();

            const categoryName = String(
                categoryNames[
                    product?.routeCategory
                ] || ""
            ).toLowerCase();

            return (
                name.includes(searchText) ||
                category.includes(searchText) ||
                subCategory.includes(searchText) ||
                brand.includes(searchText) ||
                routeCategory.includes(searchText) ||
                categoryName.includes(searchText)
            );
        })
        .sort((a, b) => {
            const aName =
                getProductName(a).toLowerCase();

            const bName =
                getProductName(b).toLowerCase();

            const aStart =
                aName.startsWith(searchText);

            const bStart =
                bName.startsWith(searchText);

            if (aStart && !bStart) {
                return -1;
            }

            if (!aStart && bStart) {
                return 1;
            }

            return 0;
        })
        .slice(0, 6);

    const filteredCategories = categories
        .filter((category) => {
            if (!searchText) {
                return false;
            }

            const name =
                categoryNames[category]?.toLowerCase() ||
                "";

            return (
                name.includes(searchText) ||
                category.includes(searchText)
            );
        })
        .slice(0, 4);

    return (
        <div
            className={`search-wrapper ${
                mobile ? "mobile-search-wrapper" : ""
            }`}
            ref={searchRef}
        >
            <form
                className="search"
                onSubmit={handleSearchSubmit}
            >
                <input
                    type="text"
                    value={search}
                    autoComplete="off"
                    placeholder="What are you looking for?"
                    onChange={(e) => {
                        const value = e.target.value;

                        setSearch(value);

                        if (value.trim()) {
                            setShowSuggestions(true);
                        } else {
                            setShowSuggestions(false);
                        }
                    }}
                    onFocus={() => {
                        if (search.trim()) {
                            setShowSuggestions(true);
                        }
                    }}
                />

                {search && (
                    <button
                        type="button"
                        className="search-clear"
                        onMouseDown={(e) => {
                            e.preventDefault();
                        }}
                        onClick={() => {
                            setSearch("");
                            setShowSuggestions(false);
                        }}
                    >
                        <i className="bi bi-x"></i>
                    </button>
                )}

                <button type="submit">
                    <i className="bi bi-search"></i>
                </button>
            </form>

            {showSuggestions && search.trim() && (
                <div className="search-suggestions">

                    {filteredProducts.length > 0 && (
                        <>
                            <div className="suggestion-heading">
                                <span>Products</span>

                                <small>
                                    {filteredProducts.length} found
                                </small>
                            </div>

                            {filteredProducts.map((product) => {
                                const productId =
                                    getDatabaseId(product);

                                return (
                                    <div
                                        className="suggestion-item"
                                        key={`${product.routeCategory}-${productId}`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();

                                            if (!productId) {
                                                console.log(
                                                    "DATABASE _id NOT FOUND:",
                                                    product
                                                );
                                                return;
                                            }

                                            handleProductClick(
                                                product
                                            );
                                        }}
                                    >
                                        <div className="suggestion-image">
                                            <img
                                                src={getProductImage(
                                                    product
                                                )}
                                                alt={getProductName(
                                                    product
                                                )}
                                            />
                                        </div>

                                        <div className="suggestion-details">
                                            <h6>
                                                {getProductName(
                                                    product
                                                )}
                                            </h6>

                                            <span className="suggestion-category">
                                                {categoryNames[
                                                    product.routeCategory
                                                ] ||
                                                    product.category}
                                            </span>

                                            <div className="suggestion-price">
                                                ₹
                                                {getProductPrice(
                                                    product
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </div>
                                        </div>

                                        <i className="bi bi-arrow-up-right suggestion-arrow"></i>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {filteredCategories.length > 0 && (
                        <>
                            <div className="suggestion-heading category-heading">
                                <span>Categories</span>
                            </div>

                            {filteredCategories.map((category) => (
                                <div
                                    className="category-suggestion-item"
                                    key={category}
                                    onMouseDown={(e) => {
                                        e.preventDefault();

                                        handleCategoryClick(
                                            category
                                        );
                                    }}
                                >
                                    <div className="category-icon">
                                        <i className="bi bi-grid"></i>
                                    </div>

                                    <div className="category-suggestion-name">
                                        {categoryNames[category]}
                                    </div>

                                    <i className="bi bi-arrow-right"></i>
                                </div>
                            ))}
                        </>
                    )}

                    {filteredProducts.length === 0 &&
                        filteredCategories.length === 0 && (
                            <div className="no-search-result">
                                <i className="bi bi-search"></i>

                                <h6>
                                    No products or categories found
                                </h6>

                                <p>
                                    Try shoes, shirts, pants, jackets...
                                </p>
                            </div>
                        )}

                    {(filteredProducts.length > 0 ||
                        filteredCategories.length > 0) && (
                        <button
                            className="view-all-search"
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                            }}
                            onClick={handleSearchSubmit}
                        >
                            View all results
                            <i className="bi bi-arrow-right"></i>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function Navbar({ onCartClick }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [showSuggestions, setShowSuggestions] =
        useState(false);

    const [isLoggedIn, setIsLoggedIn] =
        useState(false);

    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const checkLogin = () => {
            const token =
                localStorage.getItem("token");

            const user =
                localStorage.getItem("user");

            setIsLoggedIn(
                Boolean(token && user)
            );
        };

        checkLogin();

        window.addEventListener(
            "authChanged",
            checkLogin
        );

        window.addEventListener(
            "storage",
            checkLogin
        );

        return () => {
            window.removeEventListener(
                "authChanged",
                checkLogin
            );

            window.removeEventListener(
                "storage",
                checkLogin
            );
        };
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const responses =
                    await Promise.all(
                        categories.map((category) =>
                            axios.get(
                                `${API_URL}/api/products/${category}`
                            )
                        )
                    );

                const allProducts = [];

                responses.forEach(
                    (response, index) => {
                        const routeCategory =
                            categories[index];

                        let data =
                            response.data;

                        if (
                            data?.products &&
                            Array.isArray(
                                data.products
                            )
                        ) {
                            data =
                                data.products;
                        }

                        if (
                            data?.data &&
                            Array.isArray(
                                data.data
                            )
                        ) {
                            data =
                                data.data;
                        }

                        if (
                            Array.isArray(data)
                        ) {
                            data.forEach(
                                (item) => {
                                    allProducts.push({
                                        ...item,
                                        routeCategory
                                    });
                                }
                            );
                        }
                    }
                );

                setProducts(
                    allProducts
                );
            } catch (error) {
                console.log(
                    "SEARCH PRODUCTS ERROR:",
                    error.response?.data ||
                    error.message
                );
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const handleClickOutside = (
            event
        ) => {
            const desktopSearch =
                desktopSearchRef.current;

            const mobileSearch =
                mobileSearchRef.current;

            const clickedDesktop =
                desktopSearch?.contains(
                    event.target
                );

            const clickedMobile =
                mobileSearch?.contains(
                    event.target
                );

            if (
                !clickedDesktop &&
                !clickedMobile
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const handleProductClick = (
        product
    ) => {
        const productId =
            getDatabaseId(product);

        const productCategory =
            product.routeCategory;

        if (!productId) {
            console.log(
                "DATABASE _id NOT FOUND:",
                product
            );
            return;
        }

        if (!productCategory) {
            console.log(
                "ROUTE CATEGORY NOT FOUND:",
                product
            );
            return;
        }

        setSearch("");
        setShowSuggestions(false);
        setMenuOpen(false);

        navigate(
            `/${productCategory}/${productId}`
        );
    };

    const handleCategoryClick = (
        category
    ) => {
        setSearch("");
        setShowSuggestions(false);
        setMenuOpen(false);

        navigate(`/${category}`);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        const value =
            search.trim();

        if (!value) {
            return;
        }

        setShowSuggestions(false);

        navigate(
            `/search?query=${encodeURIComponent(
                value
            )}`
        );
    };

    const handleAccountClick = () => {
        setMenuOpen(false);

        const token =
            localStorage.getItem("token");

        const user =
            localStorage.getItem("user");

        if (token && user) {
            navigate("/account");
        } else {
            navigate("/login");
        }
    };

    return (
        <>
            <div className="top">
                <div className="container">
                    <div className="top-links">
                        <Link to="/store-location">
                            Store Locator
                        </Link>

                        <Link to="/help">
                            Help
                        </Link>
                    </div>
                </div>
            </div>

            <nav className="navbar bg-white">
                <div className="container">

                    <div className="main-header">

                        <button
                            className="menu-btn"
                            type="button"
                            onClick={() =>
                                setMenuOpen(
                                    (prev) =>
                                        !prev
                                )
                            }
                        >
                            <i
                                className={
                                    menuOpen
                                        ? "bi bi-x-lg"
                                        : "bi bi-list"
                                }
                            ></i>
                        </button>

                        <Link
                            to="/"
                            className="logo"
                            onClick={() =>
                                setMenuOpen(
                                    false
                                )
                            }
                        >
                            <img
                                src="https://redtape.com/cdn/shop/files/new-logo-footer_1.png?v=1707376250&width=145"
                                alt="REDTAPE"
                            />
                        </Link>

                        <div className="right">

                            <div className="desktop-search">
                                <SearchBox
                                    search={search}
                                    setSearch={setSearch}
                                    products={products}
                                    mobile={false}
                                    setShowSuggestions={
                                        setShowSuggestions
                                    }
                                    showSuggestions={
                                        showSuggestions
                                    }
                                    searchRef={
                                        desktopSearchRef
                                    }
                                    handleSearchSubmit={
                                        handleSearchSubmit
                                    }
                                    handleProductClick={
                                        handleProductClick
                                    }
                                    handleCategoryClick={
                                        handleCategoryClick
                                    }
                                />
                            </div>

                            <button
                                type="button"
                                className="icon border-0 bg-transparent"
                                onClick={
                                    handleAccountClick
                                }
                                title={
                                    isLoggedIn
                                        ? "My Account"
                                        : "Login"
                                }
                            >
                                <i className="bi bi-person"></i>
                            </button>

                            <button
                                type="button"
                                className="icon border-0 bg-transparent position-relative"
                                onClick={() => {
                                    if (onCartClick) {
                                        onCartClick();
                                    } else {
                                        navigate(
                                            "/cart"
                                        );
                                    }
                                }}
                            >
                                <i className="bi bi-bag"></i>
                            </button>

                            <Link
                                to="/wishlist"
                                className="icon wishlist"
                            >
                                <i className="bi bi-heart"></i>

                                <span>0</span>
                            </Link>

                        </div>
                    </div>

                    <div className="mobile-search">
                        <SearchBox
                            search={search}
                            setSearch={setSearch}
                            products={products}
                            mobile={true}
                            setShowSuggestions={
                                setShowSuggestions
                            }
                            showSuggestions={
                                showSuggestions
                            }
                            searchRef={
                                mobileSearchRef
                            }
                            handleSearchSubmit={
                                handleSearchSubmit
                            }
                            handleProductClick={
                                handleProductClick
                            }
                            handleCategoryClick={
                                handleCategoryClick
                            }
                        />
                    </div>

                    <div
                        className={
                            menuOpen
                                ? "nav-menu-wrapper menu-open"
                                : "nav-menu-wrapper"
                        }
                    >
                        <ul className="nav-menu">

                            <li>
                                <Link
                                    to="/shirt"
                                    onClick={() =>
                                        setMenuOpen(
                                            false
                                        )
                                    }
                                >
                                    Shirts
                                    <i className="bi bi-chevron-right"></i>
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/footwear"
                                    onClick={() =>
                                        setMenuOpen(
                                            false
                                        )
                                    }
                                >
                                    Footwear
                                    <i className="bi bi-chevron-right"></i>
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/pent"
                                    onClick={() =>
                                        setMenuOpen(
                                            false
                                        )
                                    }
                                >
                                    Pants
                                    <i className="bi bi-chevron-right"></i>
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/new-arrival"
                                    onClick={() =>
                                        setMenuOpen(
                                            false
                                        )
                                    }
                                >
                                    New Arrival
                                    <i className="bi bi-chevron-right"></i>
                                </Link>
                            </li>

                        </ul>
                    </div>

                </div>
            </nav>
        </>
    );
}

export default Navbar;