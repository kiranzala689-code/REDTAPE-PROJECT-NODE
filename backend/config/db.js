const mongoose = require("mongoose");

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI);

    const db = mongoose.connection;

    db.on("connected", () => {
        console.log("MongoDB connected");
    });

    db.on("error", (err) => {
        console.log("MongoDB connection error:", err);
    });

    db.on("disconnected", () => {
        console.log("MongoDB disconnected");
    });
};

module.exports = connectDB;