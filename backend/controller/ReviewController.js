const ReviewModel = require("../model/ReviewModel");
const OrderModel = require("../model/OrderModel");
const ProductModel = require("../model/ProductModel");

const addReview = async (req, res) => {
    try {
        const {
            productId,
            orderId,
            rating,
            comment,
            images
        } = req.body;

        if (!productId || !orderId || !rating || !comment) {
            return res.status(400).json({
                message: "Product, order, rating and comment are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const product = await ProductModel.findById(
            productId
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const order = await OrderModel.findOne({
            _id: orderId,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.orderStatus !== "Delivered") {
            return res.status(400).json({
                message: "You can review only delivered orders"
            });
        }

        const orderItem = order.items.find(
            (item) =>
                item.product.toString() === productId
        );

        if (!orderItem) {
            return res.status(400).json({
                message: "You did not purchase this product"
            });
        }

        const existingReview =
            await ReviewModel.findOne({
                user: req.user.id,
                product: productId,
                order: orderId
            });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already reviewed this product"
            });
        }

        const review = await ReviewModel.create({
            user: req.user.id,
            product: productId,
            order: orderId,
            rating,
            comment,
            images: images || []
        });

        await updateProductRating(productId);

        const populatedReview =
            await ReviewModel.findById(review._id)
                .populate("user", "name")
                .populate("product", "name");

        res.status(201).json({
            message: "Review added successfully",
            review: populatedReview
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getProductReviews = async (req, res) => {
    try {
        const reviews = await ReviewModel.find({
            product: req.params.productId,
            isApproved: true
        })
            .populate("user", "name")
            .sort({
                createdAt: -1
            });

        const totalReviews = reviews.length;

        let totalRating = 0;

        reviews.forEach((review) => {
            totalRating += review.rating;
        });

        const averageRating =
            totalReviews > 0
                ? (totalRating / totalReviews).toFixed(1)
                : 0;

        res.status(200).json({
            count: totalReviews,
            averageRating: Number(averageRating),
            reviews
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getMyReviews = async (req, res) => {
    try {
        const reviews = await ReviewModel.find({
            user: req.user.id
        })
            .populate("product", "name images price")
            .populate("order", "_id")
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            count: reviews.length,
            reviews
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const updateReview = async (req, res) => {
    try {
        const {
            rating,
            comment,
            images
        } = req.body;

        if (
            rating !== undefined &&
            (rating < 1 || rating > 5)
        ) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const review = await ReviewModel.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        review.rating =
            rating !== undefined
                ? rating
                : review.rating;

        review.comment =
            comment !== undefined
                ? comment
                : review.comment;

        review.images =
            images !== undefined
                ? images
                : review.images;

        await review.save();

        await updateProductRating(
            review.product
        );

        res.status(200).json({
            message: "Review updated successfully",
            review
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const deleteReview = async (req, res) => {
    try {
        const review = await ReviewModel.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        const productId = review.product;

        await ReviewModel.findByIdAndDelete(
            req.params.id
        );

        await updateProductRating(productId);

        res.status(200).json({
            message: "Review deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getAllReviews = async (req, res) => {
    try {
        const reviews = await ReviewModel.find()
            .populate("user", "name email")
            .populate("product", "name")
            .populate("order", "_id")
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            count: reviews.length,
            reviews
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const updateReviewApproval = async (req, res) => {
    try {
        const { isApproved } = req.body;

        if (typeof isApproved !== "boolean") {
            return res.status(400).json({
                message: "isApproved must be true or false"
            });
        }

        const review =
            await ReviewModel.findByIdAndUpdate(
                req.params.id,
                {
                    isApproved
                },
                {
                    new: true
                }
            );

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        await updateProductRating(
            review.product
        );

        res.status(200).json({
            message: "Review approval updated",
            review
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const updateProductRating = async (productId) => {
    const reviews = await ReviewModel.find({
        product: productId,
        isApproved: true
    });

    if (reviews.length === 0) {
        await ProductModel.findByIdAndUpdate(
            productId,
            {
                rating: 0,
                reviewsCount: 0
            }
        );

        return;
    }

    let totalRating = 0;

    reviews.forEach((review) => {
        totalRating += review.rating;
    });

    const averageRating =
        totalRating / reviews.length;

    await ProductModel.findByIdAndUpdate(
        productId,
        {
            rating: Number(averageRating.toFixed(1)),
            reviewsCount: reviews.length
        }
    );
};


module.exports = {
    addReview,
    getProductReviews,
    getMyReviews,
    updateReview,
    deleteReview,
    getAllReviews,
    updateReviewApproval
};