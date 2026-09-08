const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendOTPEmail = async (email, otp) => {

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "REDTAPE - Your OTP",

        html: `
            <div style="font-family: Arial; padding: 20px;">
                <h2>REDTAPE</h2>

                <p>Your OTP for verification is:</p>

                <h1>${otp}</h1>

                <p>This OTP will expire in 5 minutes.</p>

                <p>Do not share this OTP with anyone.</p>
            </div>
        `
    });
};

module.exports = sendOTPEmail;