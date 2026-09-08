const bcrypt = require("bcryptjs");

const OtpModel = require("../model/OtpModel");
const Usermodel = require("../model/UserModel");
const sendOTPEmail = require("../utils/sendEmail");

const generateOTP = () => {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
};


const sendOTP = async (req, res) => {
    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const userExists = await Usermodel.findOne({
            email: email.toLowerCase()
        });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const otp = generateOTP();

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const expiresAt = new Date(
            Date.now() + 5 * 60 * 1000
        );

        await OtpModel.deleteMany({
            email: email.toLowerCase()
        });

        await OtpModel.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            otp,
            expiresAt
        });

        await sendOTPEmail(
            email,
            otp
        );

        res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


const verifyOTP = async (req, res) => {
    try {

        const {
            email,
            otp
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const otpData = await OtpModel.findOne({
            email: email.toLowerCase(),
            otp
        });

        if (!otpData) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if (otpData.expiresAt < new Date()) {

            await OtpModel.findByIdAndDelete(
                otpData._id
            );

            return res.status(400).json({
                message: "OTP expired"
            });
        }

        const userExists = await Usermodel.findOne({
            email: email.toLowerCase()
        });

        if (userExists) {
            await OtpModel.findByIdAndDelete(
                otpData._id
            );

            return res.status(400).json({
                message: "User already exists"
            });
        }

        const user = await Usermodel.create({
            name: otpData.name,
            email: otpData.email,
            password: otpData.password
        });

        await OtpModel.findByIdAndDelete(
            otpData._id
        );

        res.status(201).json({
            message: "OTP verified and registration successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


module.exports = {
    sendOTP,
    verifyOTP
}