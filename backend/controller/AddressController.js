const AddressModel = require("../model/AddressModel");

const addAddress = async (req, res) => {
    try {
        const {
            name,
            phone,
            addressLine,
            city,
            state,
            pincode,
            addressType,
            isDefault
        } = req.body;

        if (
            !name ||
            !phone ||
            !addressLine ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                message: "All address fields are required"
            });
        }

        if (isDefault === true) {
            await AddressModel.updateMany(
                { user: req.user.id },
                { $set: { isDefault: false } }
            );
        }

        const address = await AddressModel.create({
            user: req.user.id,
            name,
            phone,
            addressLine,
            city,
            state,
            pincode,
            addressType,
            isDefault: isDefault || false
        });

        res.status(201).json({
            message: "Address added successfully",
            address
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getAddresses = async (req, res) => {
    try {
        const addresses = await AddressModel.find({
            user: req.user.id
        }).sort({
            isDefault: -1,
            createdAt: -1
        });

        res.status(200).json({
            count: addresses.length,
            addresses
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getAddressById = async (req, res) => {
    try {
        const address = await AddressModel.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        res.status(200).json({
            address
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const updateAddress = async (req, res) => {
    try {
        const {
            name,
            phone,
            addressLine,
            city,
            state,
            pincode,
            addressType,
            isDefault
        } = req.body;

        const address = await AddressModel.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        if (isDefault === true) {
            await AddressModel.updateMany(
                { user: req.user.id },
                { $set: { isDefault: false } }
            );
        }

        address.name = name ?? address.name;
        address.phone = phone ?? address.phone;
        address.addressLine = addressLine ?? address.addressLine;
        address.city = city ?? address.city;
        address.state = state ?? address.state;
        address.pincode = pincode ?? address.pincode;
        address.addressType = addressType ?? address.addressType;

        if (isDefault !== undefined) {
            address.isDefault = isDefault;
        }

        await address.save();

        res.status(200).json({
            message: "Address updated successfully",
            address
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const deleteAddress = async (req, res) => {
    try {
        const address = await AddressModel.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        res.status(200).json({
            message: "Address deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const setDefaultAddress = async (req, res) => {
    try {
        const address = await AddressModel.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        await AddressModel.updateMany(
            { user: req.user.id },
            { $set: { isDefault: false } }
        );

        address.isDefault = true;

        await address.save();

        res.status(200).json({
            message: "Default address updated",
            address
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    addAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};