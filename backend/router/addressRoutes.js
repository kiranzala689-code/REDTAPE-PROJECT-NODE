const express = require("express");

const {
    addAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require("../controller/AddressController");

const auth = require("../middleware/authMiddleware");

const address_router = express.Router();

address_router.post(
    "/",
    auth,
    addAddress
);

address_router.get(
    "/",
    auth,
    getAddresses
);

address_router.get(
    "/:id",
    auth,
    getAddressById
);

address_router.put(
    "/:id",
    auth,
    updateAddress
);

address_router.delete(
    "/:id",
    auth,
    deleteAddress
);

address_router.patch(
    "/:id/default",
    auth,
    setDefaultAddress
);

module.exports = address_router;