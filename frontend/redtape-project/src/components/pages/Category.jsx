import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "./Category.css";

const API_URL = "https://redtape-project-node-3.onrender.com";

function Category() {
    const { category } = useParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [sortBy, setSortBy] = useState("featured");
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);

    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(0);

    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        const getProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    `${API_URL}/api/products/${category}`
                );

                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data?.products || [];

                setProducts(data);

                if (data.length > 0) {
                    const prices = data.map((product) =>
                        Number(
                            product.discountPrice ||
                            product.price ||
                            0
                        )
                    );

                    setPriceMin(0);
                    setPriceMax(Math.max(...prices));
                } else {
                    setPriceMin(0);
                    setPriceMax(0);
                }
            } catch (error) {
                console.log(
                    "CATEGORY PRODUCTS ERROR:",
                    error.response?.data || error.message
                );

                setError(
                    "Products load nahi ho pa rahe hain."
                );

                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        if (category) {
            getProducts();
        }
    }, [category]);

    const getPrice = (product) => {
        return Number(
            product.discountPrice ||
            product.price ||
            0
        );
    };

    const getDiscount = (product) => {
        const originalPrice = Number(
            product.price || 0
        );

        const salePrice = Number(
            product.discountPrice || 0
        );

        if (
            originalPrice > 0 &&
            salePrice > 0 &&
            originalPrice > salePrice
        ) {
            return Math.round(
                ((originalPrice - salePrice) /
                    originalPrice) *
                    100
            );
        }

        return 0;
    };

    const formatCategoryName = (value) => {
        return decodeURIComponent(value || "")
            .replace(/-/g, " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    const highestPrice = useMemo(() => {
        if (!products.length) {
            return 0;
        }

        return Math.max(
            ...products.map((product) =>
                getPrice(product)
            )
        );
    }, [products]);

    const sizes = useMemo(() => {
        const sizeCount = {};

        products.forEach((product) => {
            if (Array.isArray(product.sizes)) {
                product.sizes.forEach((size) => {
                    const value = String(size);

                    sizeCount[value] =
                        (sizeCount[value] || 0) + 1;
                });
            }
        });

        return Object.entries(sizeCount).sort(
            (a, b) =>
                Number(a[0]) - Number(b[0])
        );
    }, [products]);

    const colors = useMemo(() => {
        const colorCount = {};

        products.forEach((product) => {
            if (Array.isArray(product.colors)) {
                product.colors.forEach((color) => {
                    const value = String(color);

                    colorCount[value] =
                        (colorCount[value] || 0) + 1;
                });
            }
        });

        return Object.entries(colorCount).sort(
            (a, b) =>
                a[0].localeCompare(b[0])
        );
    }, [products]);

    const toggleSize = (size) => {
        setSelectedSizes((previous) => {
            if (previous.includes(size)) {
                return previous.filter(
                    (item) => item !== size
                );
            }

            return [...previous, size];
        });
    };

    const toggleColor = (color) => {
        setSelectedColors((previous) => {
            if (previous.includes(color)) {
                return previous.filter(
                    (item) => item !== color
                );
            }

            return [...previous, color];
        });
    };

    const filteredProducts = useMemo(() => {
        let result = products.filter((product) => {
            const price = getPrice(product);

            const priceMatch =
                price >= priceMin &&
                price <= priceMax;

            const sizeMatch =
                selectedSizes.length === 0 ||
                selectedSizes.some((selectedSize) =>
                    product.sizes?.some(
                        (size) =>
                            String(size) ===
                            String(selectedSize)
                    )
                );

            const colorMatch =
                selectedColors.length === 0 ||
                selectedColors.some((selectedColor) =>
                    product.colors?.some(
                        (color) =>
                            String(color).toLowerCase() ===
                            String(selectedColor).toLowerCase()
                    )
                );

            return (
                priceMatch &&
                sizeMatch &&
                colorMatch
            );
        });

        if (sortBy === "price-low") {
            result.sort(
                (a, b) =>
                    getPrice(a) - getPrice(b)
            );
        }

        if (sortBy === "price-high") {
            result.sort(
                (a, b) =>
                    getPrice(b) - getPrice(a)
            );
        }

        if (sortBy === "rating") {
            result.sort(
                (a, b) =>
                    Number(b.rating || 0) -
                    Number(a.rating || 0)
            );
        }

        if (sortBy === "discount") {
            result.sort(
                (a, b) =>
                    getDiscount(b) -
                    getDiscount(a)
            );
        }

        if (sortBy === "newest") {
            result.sort(
                (a, b) =>
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
            );
        }

        return result;
    }, [
        products,
        priceMin,
        priceMax,
        selectedSizes,
        selectedColors,
        sortBy
    ]);

    const clearFilters = () => {
        setSelectedSizes([]);
        setSelectedColors([]);
        setPriceMin(0);
        setPriceMax(highestPrice);
    };

    const handleMinPrice = (value) => {
        let number = Number(value);

        if (number < 0) {
            number = 0;
        }

        if (number >= priceMax) {
            number = Math.max(0, priceMax - 1);
        }

        setPriceMin(number);
    };

    const handleMaxPrice = (value) => {
        let number = Number(value);

        if (number > highestPrice) {
            number = highestPrice;
        }

        if (number <= priceMin) {
            number = Math.min(
                highestPrice,
                priceMin + 1
            );
        }

        setPriceMax(number);
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">
                    <div
                        className="spinner-border"
                        role="status"
                    ></div>

                    <p className="mt-3 text-muted">
                        Loading products...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="category-page">
            <div className="container-fluid px-3 px-lg-4">

                <div className="category-top">

                    <div className="category-breadcrumb">
                        <Link to="/">
                            HOME
                        </Link>

                        <span>/</span>

                        <span>
                            {formatCategoryName(
                                category
                            )}
                        </span>
                    </div>

                    <div className="category-title-row">

                        <div>
                            <h1>
                                {formatCategoryName(
                                    category
                                )}
                            </h1>

                            <span>
                                {filteredProducts.length} products
                            </span>
                        </div>

                        <div className="sort-area">

                            <span>
                                Sort By:
                            </span>

                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="featured">
                                    Featured
                                </option>

                                <option value="newest">
                                    Newest
                                </option>

                                <option value="price-low">
                                    Price: Low to High
                                </option>

                                <option value="price-high">
                                    Price: High to Low
                                </option>

                                <option value="rating">
                                    Rating
                                </option>

                                <option value="discount">
                                    Discount
                                </option>
                            </select>

                        </div>

                    </div>

                </div>

                <div className="mobile-filter-bar">

                    <button
                        type="button"
                        onClick={() =>
                            setFilterOpen(
                                !filterOpen
                            )
                        }
                    >
                        ☰ Filter
                    </button>

                    <span>
                        {filteredProducts.length} products
                    </span>

                </div>

                {error && (
                    <div className="alert alert-danger rounded-0">
                        {error}
                    </div>
                )}

                {products.length > 0 && (
                    <div className="row gx-4">

                        <div
                            className={
                                filterOpen
                                    ? "col-lg-3 filter-column filter-mobile-show"
                                    : "col-lg-3 filter-column"
                            }
                        >

                            <div className="filter-sidebar">

                                <div className="filter-header">

                                    <div>
                                        <strong>
                                            Filter
                                        </strong>

                                        <span>
                                            {filteredProducts.length} products
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                    >
                                        Clear
                                    </button>

                                </div>

                                <div className="filter-section">

                                    <div className="filter-heading">

                                        <strong>
                                            Price
                                        </strong>

                                        <span>
                                            −
                                        </span>

                                    </div>

                                    <p>
                                        The highest price is ₹{" "}
                                        {highestPrice.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2
                                            }
                                        )}
                                    </p>

                                    <div className="range-box">

                                        <input
                                            type="range"
                                            min="0"
                                            max={
                                                highestPrice ||
                                                1
                                            }
                                            value={priceMin}
                                            onChange={(e) =>
                                                handleMinPrice(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <input
                                            type="range"
                                            min="0"
                                            max={
                                                highestPrice ||
                                                1
                                            }
                                            value={priceMax}
                                            onChange={(e) =>
                                                handleMaxPrice(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                    <div className="price-inputs">

                                        <div>
                                            <span>
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                value={
                                                    priceMin
                                                }
                                                onChange={(e) =>
                                                    handleMinPrice(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <span>
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                value={
                                                    priceMax
                                                }
                                                onChange={(e) =>
                                                    handleMaxPrice(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                    </div>

                                </div>

                                <div className="filter-section">

                                    <div className="filter-heading">

                                        <strong>
                                            Size
                                        </strong>

                                        <span>
                                            −
                                        </span>

                                    </div>

                                    <div className="filter-list">

                                        {sizes.map(
                                            ([
                                                size,
                                                count
                                            ]) => (
                                                <label
                                                    key={
                                                        size
                                                    }
                                                >

                                                    <div>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSizes.includes(
                                                                size
                                                            )}
                                                            onChange={() =>
                                                                toggleSize(
                                                                    size
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            {
                                                                size
                                                            }
                                                        </span>
                                                    </div>

                                                    <small>
                                                        {
                                                            count
                                                        }
                                                    </small>

                                                </label>
                                            )
                                        )}

                                    </div>

                                </div>

                                <div className="filter-section">

                                    <div className="filter-heading">

                                        <strong>
                                            Color
                                        </strong>

                                        <span>
                                            −
                                        </span>

                                    </div>

                                    <div className="filter-list color-list">

                                        {colors.map(
                                            ([
                                                color,
                                                count
                                            ]) => (
                                                <label
                                                    key={
                                                        color
                                                    }
                                                >

                                                    <div>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedColors.includes(
                                                                color
                                                            )}
                                                            onChange={() =>
                                                                toggleColor(
                                                                    color
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            {
                                                                color
                                                            }
                                                        </span>
                                                    </div>

                                                    <small>
                                                        {
                                                            count
                                                        }
                                                    </small>

                                                </label>
                                            )
                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="col-lg-9">

                            <div className="products-count-bar">

                                <span>
                                    {filteredProducts.length} products
                                </span>

                                {(selectedSizes.length >
                                    0 ||
                                    selectedColors.length >
                                        0 ||
                                    priceMin > 0 ||
                                    priceMax <
                                        highestPrice) && (
                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                    >
                                        Clear Filters
                                    </button>
                                )}

                            </div>

                            {filteredProducts.length ===
                            0 ? (
                                <div className="no-products">

                                    <h4>
                                        No products found
                                    </h4>

                                    <p>
                                        Try changing your filters.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                    >
                                        Clear Filters
                                    </button>

                                </div>
                            ) : (
                                <div className="row product-grid">

                                    {filteredProducts.map(
                                        (product) => {

                                            const productId =
                                                product._id ||
                                                product.id;

                                            const price =
                                                getPrice(
                                                    product
                                                );

                                            const originalPrice =
                                                Number(
                                                    product.price ||
                                                    0
                                                );

                                            const discount =
                                                getDiscount(
                                                    product
                                                );

                                            const image =
                                                product
                                                    .images?.[0] ||
                                                product.image ||
                                                product.img ||
                                                "";

                                            return (
                                                <div
                                                    className="col-6 col-md-4 col-lg-3"
                                                    key={
                                                        productId
                                                    }
                                                >

                                                    <div className="product-card">

                                                        <div className="product-image-wrap">

                                                            <Link
                                                                to={`/${category}/${productId}`}
                                                            >

                                                                {image ? (
                                                                    <img
                                                                        src={
                                                                            image
                                                                        }
                                                                        alt={
                                                                            product.name
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <div className="no-image">
                                                                        No Image
                                                                    </div>
                                                                )}

                                                            </Link>

                                                            <button
                                                                type="button"
                                                                className="wishlist-button"
                                                            >
                                                                ♡
                                                            </button>

                                                        </div>

                                                        <Link
                                                            to={`/${category}/${productId}`}
                                                            className="product-info"
                                                        >

                                                            <h6>
                                                                {
                                                                    product.name
                                                                }
                                                            </h6>

                                                            <div className="price-line">

                                                                {discount >
                                                                    0 && (
                                                                    <span className="save-badge">
                                                                        Save{" "}
                                                                        {
                                                                            discount
                                                                        }
                                                                        %
                                                                    </span>
                                                                )}

                                                                <span className="sale-price">
                                                                    ₹{" "}
                                                                    {price.toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </span>

                                                                {originalPrice >
                                                                    price && (
                                                                    <span className="old-price">
                                                                        ₹{" "}
                                                                        {originalPrice.toLocaleString(
                                                                            "en-IN"
                                                                        )}
                                                                    </span>
                                                                )}

                                                            </div>

                                                        </Link>

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>
                            )}

                        </div>

                    </div>
                )}

                {products.length === 0 && !error && (
                    <div className="no-products">
                        <h4>
                            No products found
                        </h4>

                        <p>
                            There are no products in this category.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Category;