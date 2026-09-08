
const bcrypt = require("bcryptjs");

const Usermodel = require("../model/UserModel");
const CartModel = require("../model/CartModel");

const generateToken = require("../utils/generateToken");


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const userExists = await Usermodel.findOne({
            email
        });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await Usermodel.create({
            name,
            email,
            password: hashedPassword
        });

        const token = generateToken(user);

        res.status(201).json({
            message: "Registration successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },

            token
        });

    } catch (error) {

        console.log(
            "REGISTER ERROR:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};


const loginUser = async (req, res) => {
    try {

        const {
            email,
            password,
            guestId
        } = req.body;

        const user = await Usermodel.findOne({
            email
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        console.log(
            "LOGIN USER:",
            user._id
        );

        console.log(
            "LOGIN GUEST ID:",
            guestId
        );


        let userCart =
            await CartModel.findOne({
                user: user._id
            });


        let guestCart = null;

        if (guestId) {

            guestCart =
                await CartModel.findOne({
                    guestId: guestId
                });

        }


        if (guestCart) {

            console.log(
                "GUEST CART FOUND:",
                guestCart._id
            );


            if (!userCart) {

                guestCart.user =
                    user._id;

                guestCart.guestId =
                    null;

                await guestCart.save();

                userCart =
                    guestCart;

            } else {

                for (
                    const guestItem
                    of guestCart.items
                ) {

                    const existingItem =
                        userCart.items.find(
                            item =>
                                item.product.toString() ===
                                    guestItem.product.toString() &&
                                String(item.size) ===
                                    String(guestItem.size) &&
                                item.color ===
                                    guestItem.color
                        );


                    if (existingItem) {

                        existingItem.quantity +=
                            guestItem.quantity;

                    } else {

                        userCart.items.push({
                            product:
                                guestItem.product,

                            quantity:
                                guestItem.quantity,

                            size:
                                guestItem.size,

                            color:
                                guestItem.color
                        });

                    }
                }


                await userCart.save();


                await CartModel.findByIdAndDelete(
                    guestCart._id
                );
            }

            console.log(
                "GUEST CART MERGED SUCCESSFULLY"
            );

        } else {

            console.log(
                "NO GUEST CART FOUND"
            );
        }


        const token =
            generateToken(user);


        res.status(200).json({

            message:
                "Login successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },

            token

        });

    } catch (error) {

        console.log(
            "LOGIN ERROR:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};


const getProfile = async (req, res) => {
    try {

        const user =
            await Usermodel
                .findById(req.user.id)
                .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });

    } catch (error) {

        console.log(
            "PROFILE ERROR:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getProfile
};
