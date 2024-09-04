const mongoose = require("mongoose");

const connectDB = async () => {
    return mongoose
        .connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log("MongoDB connected..."));
};

module.exports = connectDB;
