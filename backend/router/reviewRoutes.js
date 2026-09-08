const express = require("express");

const {
    addReview,
    getProductReviews,
    getMyReviews,
    updateReview,
    deleteReview,
    getAllReviews,
    updateReviewApproval
} = require("../controller/ReviewController");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

const review_router = express.Router();

review_router.post(
    "/",
    auth,
    addReview
);

review_router.get(
    "/product/:productId",
    getProductReviews
);

review_router.get(
    "/my-reviews",
    auth,
    getMyReviews
);

review_router.put(
    "/:id",
    auth,
    updateReview
);

review_router.delete(
    "/:id",
    auth,
    deleteReview
);

review_router.get(
    "/admin/all",
    auth,
    admin,
    getAllReviews
);

review_router.patch(
    "/admin/:id/approval",
    auth,
    admin,
    updateReviewApproval
);

module.exports = review_router;