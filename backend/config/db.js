const mongoose = require("mongoose");

const connectDB = () => {
    if (!process.env.MONGO_URI) {
        console.log("MONGO_URI is not defined");
        return;
    }

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