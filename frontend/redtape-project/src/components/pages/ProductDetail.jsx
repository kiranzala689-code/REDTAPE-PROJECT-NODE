import React, {
    useCallback,
    useEffect,
    useState
} from "react";
import axios from "axios";
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";
import "./ProductDetail.css";

function ProductDetail() {
    const { category, id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    const [selectedImage, setSelectedImage] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [addingCart, setAddingCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);

    const categoryMap = {
        footwear: "Footwear",
        shoes: "Footwear",
        pent: "Pants",
        pants: "Pants",
        pents: "Pants",
        shirt: "Shirts",
        shirts: "Shirts",
        womens: "Womens",
        women: "Womens",
        accessories: "Accessories",
        "new-arrival": "New Arrival"
    };

    const getBackendCategory = useCallback((value) => {
        return (
            categoryMap[
                String(value || "").toLowerCase()
            ] || value
        );
    }, []);

    const getSizeValue = (size) => {
        if (
            typeof size === "object" &&
            size !== null
        ) {
            return String(
                size.size ||
                size.name ||
                size.value ||
                ""
            );
        }

        return String(size);
    };

    const getPrice = (item) => {
        return Number(
            item?.discountPrice ||
            item?.price ||
            0
        );
    };

    const getOriginalPrice = (item) => {
        return Number(item?.price || 0);
    };

    const getDiscount = (item) => {
        const original = getOriginalPrice(item);
        const sale = getPrice(item);

        if (
            original > sale &&
            original > 0
        ) {
            return Math.round(
                ((original - sale) / original) * 100
            );
        }

        return 0;
    };

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const getGuestId = () => {
        let guestId = localStorage.getItem("guestId");

        if (!guestId) {
            guestId =
                "guest_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 10);

            localStorage.setItem(
                "guestId",
                guestId
            );
        }

        return guestId;
    };

    const getUserIdFromToken = () => {
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

            return (
                payload.id ||
                payload._id ||
                payload.userId ||
                null
            );
        } catch (error) {
            return null;
        }
    };

    const getCartOwner = () => {
        const token = getToken();
        const userId = getUserIdFromToken();

        if (
            token &&
            userId
        ) {
            return {
                userId,
                guestId: null
            };
        }

        return {
            userId: null,
            guestId: getGuestId()
        };
    };

    useEffect(() => {
        const getProduct = async () => {
            try {
                setLoading(true);

                let response;

                if (category) {
                    const backendCategory =
                        getBackendCategory(category);

                    response = await axios.get(
                        `http://localhost:5000/api/products/${encodeURIComponent(
                            backendCategory
                        )}/${id}`
                    );
                } else {
                    response = await axios.get(
                        `http://localhost:5000/api/products/single/${id}`
                    );
                }

                let data =
                    response.data?.product ||
                    response.data?.data ||
                    response.data;

                if (data?.product) {
                    data = data.product;
                }

                if (Array.isArray(data)) {
                    data = data[0];
                }

                setProduct(data || null);

                const images =
                    Array.isArray(data?.images)
                        ? data.images
                        : [];

                setSelectedImage(
                    images[0] || ""
                );

                const sizes =
                    Array.isArray(data?.sizes)
                        ? data.sizes
                        : [];

                setSelectedSize(
                    sizes.length
                        ? getSizeValue(sizes[0])
                        : ""
                );

                const colors =
                    Array.isArray(data?.colors)
                        ? data.colors
                        : [];

                setSelectedColor(
                    colors.length
                        ? String(colors[0])
                        : ""
                );

                setQuantity(1);
            } catch (error) {
                console.log(
                    "PRODUCT ERROR:",
                    error.response?.data ||
                    error.message
                );

                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        if (
            category &&
            id
        ) {
            getProduct();
        }
    }, [
        category,
        id,
        getBackendCategory
    ]);

    useEffect(() => {
        const getRecommended = async () => {
            if (!product) {
                return;
            }

            try {
                const backendCategory =
                    getBackendCategory(
                        product.category
                    );

                const response =
                    await axios.get(
                        `http://localhost:5000/api/products/${encodeURIComponent(
                            backendCategory
                        )}`
                    );

                const data =
                    response.data?.products ||
                    response.data?.data ||
                    response.data ||
                    [];

                if (!Array.isArray(data)) {
                    setRecommendedProducts([]);
                    return;
                }

                const currentId =
                    String(product._id);

                const filtered =
                    data.filter(
                        (item) =>
                            String(item._id) !==
                            currentId
                    );

                setRecommendedProducts(
                    filtered.slice(0, 8)
                );
            } catch (error) {
                console.log(
                    "RECOMMENDED ERROR:",
                    error.response?.data ||
                    error.message
                );

                setRecommendedProducts([]);
            }
        };

        getRecommended();
    }, [
        product,
        getBackendCategory
    ]);

    const increaseQuantity = () => {
        const stock = Number(
            product?.stock || 0
        );

        if (quantity < stock) {
            setQuantity(
                (previous) =>
                    previous + 1
            );
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(
                (previous) =>
                    previous - 1
            );
        }
    };

    const validateProduct = () => {
        if (!product) {
            return false;
        }

        const stock = Number(
            product.stock || 0
        );

        if (stock <= 0) {
            alert(
                "Product is out of stock"
            );

            return false;
        }

        if (
            product.sizes?.length > 0 &&
            !selectedSize
        ) {
            alert(
                "Please select size"
            );

            return false;
        }

        if (
            product.colors?.length > 0 &&
            !selectedColor
        ) {
            alert(
                "Please select color"
            );

            return false;
        }

        if (quantity > stock) {
            alert(
                "Not enough stock"
            );

            return false;
        }

        return true;
    };

    const addProductToCart = async () => {
        try {
            if (!validateProduct()) {
                return false;
            }

            const token = getToken();

            const {
                userId,
                guestId
            } = getCartOwner();

            const cartData = {
                product: product._id,
                quantity: Number(quantity),
                size: String(
                    selectedSize || ""
                ),
                color: String(
                    selectedColor || ""
                )
            };

            if (userId) {
                cartData.user = userId;
                cartData.userId = userId;
            } else {
                cartData.guestId = guestId;
            }

            const config = token
                ? {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
                : {};

            await axios.post(
                "http://localhost:5000/api/cart",
                cartData,
                config
            );

            window.dispatchEvent(
                new Event("cartUpdated")
            );

            return true;
        } catch (error) {
            console.log(
                "ADD CART ERROR:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Product cart me add nahi hua"
            );

            return false;
        }
    };

    const addToCart = async () => {
        try {
            setAddingCart(true);

            const success =
                await addProductToCart();

            if (success) {
                alert(
                    "Product added to cart"
                );
            }
        } finally {
            setAddingCart(false);
        }
    };

    const buyNow = async () => {
        try {
            if (!validateProduct()) {
                return;
            }

            setBuyingNow(true);

            const success =
                await addProductToCart();

            if (success) {
                navigate("/checkout");
            }
        } finally {
            setBuyingNow(false);
        }
    };

    const openRecommended = (item) => {
        const routeMap = {
            Footwear: "footwear",
            Pants: "pent",
            Shirts: "shirt",
            Womens: "womens",
            Accessories: "accessories",
            "New Arrival":
                "new-arrival"
        };

        const routeCategory =
            routeMap[item.category] ||
            String(
                item.category
            ).toLowerCase();

        navigate(
            `/${routeCategory}/${item._id}`
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const shareProduct = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: product.name,
                    text: product.name,
                    url: window.location.href
                });
            } else {
                await navigator.clipboard.writeText(
                    window.location.href
                );

                alert(
                    "Product link copied"
                );
            }
        } catch (error) {
            console.log(
                error.message
            );
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

                    <p className="mt-3 text-muted">
                        Loading product...
                    </p>

                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">

                    <h3 className="fw-bold">
                        PRODUCT NOT FOUND
                    </h3>

                    <p className="text-muted">
                        This product is currently unavailable.
                    </p>

                    <Link
                        to="/"
                        className="btn btn-dark px-5 py-3"
                    >
                        CONTINUE SHOPPING
                    </Link>

                </div>
            </div>
        );
    }

    const productName =
        product.name || "Product";

    const brand =
        product.brand || "WROGN";

    const productCategory =
        product.category || "Category";

    const price =
        getPrice(product);

    const originalPrice =
        getOriginalPrice(product);

    const discount =
        getDiscount(product);

    const description =
        product.description ||
        "No description available.";

    const stock =
        Number(product.stock || 0);

    const images =
        Array.isArray(product.images)
            ? product.images
            : [];

    const sizes =
        Array.isArray(product.sizes)
            ? product.sizes
            : [];

    const colors =
        Array.isArray(product.colors)
            ? product.colors
            : [];

    return (
        <div className="product-detail-page">

            <div className="container-fluid px-3 px-lg-4">

                <div className="breadcrumb-text">

                    <Link to="/">
                        HOME
                    </Link>

                    <span>/</span>

                    <Link
                        to={
                            category
                                ? `/${category}`
                                : "/"
                        }
                    >
                        {productCategory}
                    </Link>

                    <span>/</span>

                    <span>
                        {productName}
                    </span>

                </div>

                <div className="row product-detail-row g-4 g-lg-5">

                    <div className="col-lg-7">

                        <div className="product-gallery">

                            <div className="thumbnail-list">

                                {images.map(
                                    (
                                        image,
                                        index
                                    ) => (
                                        <button
                                            type="button"
                                            key={`${image}-${index}`}
                                            className={
                                                selectedImage ===
                                                image
                                                    ? "thumbnail active-thumbnail"
                                                    : "thumbnail"
                                            }
                                            onClick={() =>
                                                setSelectedImage(
                                                    image
                                                )
                                            }
                                        >
                                            <img
                                                src={image}
                                                alt={productName}
                                            />
                                        </button>
                                    )
                                )}

                            </div>

                            <div className="main-product-image">

                                {selectedImage && (
                                    <img
                                        src={
                                            selectedImage
                                        }
                                        alt={
                                            productName
                                        }
                                    />
                                )}

                                {discount > 0 && (
                                    <span className="product-image-discount">
                                        {discount}% OFF
                                    </span>
                                )}

                            </div>

                        </div>

                    </div>

                    <div className="col-lg-5">

                        <div className="product-detail-info">

                            <div className="small text-muted text-uppercase mb-2">
                                {brand}
                            </div>

                            <h1>
                                {productName}
                            </h1>

                            <div className="product-meta">

                                <span>
                                    Category:
                                    <strong>
                                        {productCategory}
                                    </strong>
                                </span>

                                <span className="meta-line" />

                                <span>
                                    Brand:
                                    <strong>
                                        {brand}
                                    </strong>
                                </span>

                            </div>

                            <div className="price-section">

                                {discount > 0 && (
                                    <span className="discount-badge">
                                        {discount}% OFF
                                    </span>
                                )}

                                <span className="detail-price">
                                    ₹
                                    {price.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>

                                {originalPrice >
                                    price && (
                                    <span className="detail-original-price">
                                        ₹
                                        {originalPrice.toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>
                                )}

                            </div>

                            <p className="tax-text">
                                Tax included.
                            </p>

                            <div className="product-meta">

                                <span>
                                    Rating:
                                    <strong>
                                        ⭐{" "}
                                        {product.rating || 0}
                                    </strong>
                                </span>

                                <span className="meta-line" />

                                <span>
                                    <strong>
                                        {product.reviewsCount || 0}
                                    </strong>{" "}
                                    Reviews
                                </span>

                            </div>

                            {sizes.length > 0 && (
                                <div className="mb-4">

                                    <div className="size-heading">

                                        <span>
                                            Size:
                                            <strong>
                                                {
                                                    selectedSize
                                                }
                                            </strong>
                                        </span>

                                        <button
                                            type="button"
                                        >
                                            Size Chart
                                        </button>

                                    </div>

                                    <div className="size-list">

                                        {sizes.map(
                                            (
                                                size,
                                                index
                                            ) => {

                                                const value =
                                                    getSizeValue(
                                                        size
                                                    );

                                                return (
                                                    <button
                                                        type="button"
                                                        key={`${value}-${index}`}
                                                        className={
                                                            String(
                                                                selectedSize
                                                            ) ===
                                                            value
                                                                ? "size-btn selected-size"
                                                                : "size-btn"
                                                        }
                                                        onClick={() =>
                                                            setSelectedSize(
                                                                value
                                                            )
                                                        }
                                                    >
                                                        {value}
                                                    </button>
                                                );
                                            }
                                        )}

                                    </div>

                                </div>
                            )}

                            {colors.length > 0 && (
                                <div className="color-section">

                                    <p>
                                        Color:
                                        <strong>
                                            {
                                                selectedColor
                                            }
                                        </strong>
                                    </p>

                                    <div className="color-list">

                                        {colors.map(
                                            (color) => (
                                                <button
                                                    type="button"
                                                    key={color}
                                                    className={
                                                        String(
                                                            selectedColor
                                                        ).toLowerCase() ===
                                                        String(
                                                            color
                                                        ).toLowerCase()
                                                            ? "color-option selected-color"
                                                            : "color-option"
                                                    }
                                                    onClick={() =>
                                                        setSelectedColor(
                                                            String(
                                                                color
                                                            )
                                                        )
                                                    }
                                                >
                                                    {color}
                                                </button>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                            <div className="product-buy-row">

                                <div className="quantity-box">

                                    <button
                                        type="button"
                                        onClick={
                                            decreaseQuantity
                                        }
                                        disabled={
                                            quantity <=
                                            1
                                        }
                                    >
                                        −
                                    </button>

                                    <span>
                                        {quantity}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={
                                            increaseQuantity
                                        }
                                        disabled={
                                            quantity >=
                                            stock
                                        }
                                    >
                                        +
                                    </button>

                                </div>

                                <button
                                    type="button"
                                    className="add-cart-button"
                                    disabled={
                                        stock <= 0 ||
                                        addingCart ||
                                        buyingNow
                                    }
                                    onClick={
                                        addToCart
                                    }
                                >
                                    {addingCart
                                        ? "ADDING..."
                                        : "ADD TO CART"}
                                </button>

                            </div>

                            <button
                                type="button"
                                className="buy-now-button"
                                disabled={
                                    stock <= 0 ||
                                    addingCart ||
                                    buyingNow
                                }
                                onClick={buyNow}
                            >
                                {buyingNow
                                    ? "PROCESSING..."
                                    : "BUY NOW →"}
                            </button>

                            <div className="stock-text">
                                {stock > 0
                                    ? `${stock} items available`
                                    : "Out of stock"}
                            </div>

                            <div className="delivery-box">

                                <h6>
                                    Delivery Option
                                </h6>

                                <div className="delivery-input">

                                    <input
                                        type="text"
                                        placeholder="Enter Pincode"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            alert(
                                                "Delivery availability will be checked."
                                            )
                                        }
                                    >
                                        Check
                                    </button>

                                </div>

                            </div>

                            <div className="share-section">

                                <span>
                                    Share:
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        shareProduct
                                    }
                                >
                                    f
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        shareProduct
                                    }
                                >
                                    X
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        shareProduct
                                    }
                                >
                                    p
                                </button>

                            </div>

                            <button
                                type="button"
                                className="wishlist-button"
                                onClick={() =>
                                    alert(
                                        "Product added to wishlist"
                                    )
                                }
                            >
                                ♡ Add to Wishlist
                            </button>

                        </div>

                    </div>

                </div>

                <div className="description">

                    <h5>
                        DESCRIPTION
                    </h5>

                    <p>
                        {description}
                    </p>

                </div>

                <div className="product-extra">

                    <div>
                        <strong>
                            CATEGORY
                        </strong>

                        <span>
                            {productCategory}
                        </span>
                    </div>

                    <div>
                        <strong>
                            SUB CATEGORY
                        </strong>

                        <span>
                            {product.subCategory || "-"}
                        </span>
                    </div>

                    <div>
                        <strong>
                            GENDER
                        </strong>

                        <span>
                            {product.gender || "-"}
                        </span>
                    </div>

                    <div>
                        <strong>
                            MATERIAL
                        </strong>

                        <span>
                            {product.material || "-"}
                        </span>
                    </div>

                    <div>
                        <strong>
                            BRAND
                        </strong>

                        <span>
                            {brand}
                        </span>
                    </div>

                </div>

                {recommendedProducts.length > 0 && (
                    <section className="recommended-section">

                        <div className="recommended-heading">

                            <div>

                                <p>
                                    YOU MAY ALSO LIKE
                                </p>

                                <h2>
                                    RECOMMENDED FOR YOU
                                </h2>

                            </div>

                            <Link
                                to={`/${category}`}
                                className="recommended-view-all"
                            >
                                VIEW ALL
                            </Link>

                        </div>

                        <div className="recommended-scroll">

                            {recommendedProducts.map(
                                (item) => {

                                    const itemPrice =
                                        getPrice(item);

                                    const itemOriginalPrice =
                                        getOriginalPrice(
                                            item
                                        );

                                    const itemDiscount =
                                        getDiscount(item);

                                    const itemImage =
                                        item.images?.[0] ||
                                        "";

                                    return (
                                        <div
                                            className="recommended-card"
                                            key={item._id}
                                            onClick={() =>
                                                openRecommended(
                                                    item
                                                )
                                            }
                                        >

                                            <div className="recommended-image">

                                                {itemImage ? (
                                                    <img
                                                        src={
                                                            itemImage
                                                        }
                                                        alt={
                                                            item.name
                                                        }
                                                    />
                                                ) : (
                                                    <div className="no-recommended-image">
                                                        No Image
                                                    </div>
                                                )}

                                                {itemDiscount >
                                                    0 && (
                                                    <span className="recommended-discount">
                                                        {
                                                            itemDiscount
                                                        }
                                                        % OFF
                                                    </span>
                                                )}

                                            </div>

                                            <div className="recommended-info">

                                                <small>
                                                    {item.brand ||
                                                        "WROGN"}
                                                </small>

                                                <h6>
                                                    {item.name}
                                                </h6>

                                                <div className="recommended-price">

                                                    <strong>
                                                        ₹
                                                        {itemPrice.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </strong>

                                                    {itemOriginalPrice >
                                                        itemPrice && (
                                                        <span>
                                                            ₹
                                                            {itemOriginalPrice.toLocaleString(
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

                    </section>
                )}

            </div>
        </div>
    );
}

export default ProductDetail;