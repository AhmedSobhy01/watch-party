const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const socketService = require("./services/socketService");

require("dotenv").config();

const app = express();

// Request body parser
app.use(express.json());

// CORS
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Routes
app.use("/room", require("./routes/room"));
app.use((req, res, next) => res.status(404).send("404 Not Found"));

// Server setup
connectDB()
    .then(() => {
        return new Promise((resolve) => {
            const port = process.env.PORT || 5000;

            const server = app.listen(port, (err) => {
                if (err) throw err;

                console.log(`Server started on port ${port}`);

                resolve(server);
            });
        });
    })
    .then((server) => socketService(server))
    .catch((err) => {
        console.error(`Error while starting server: ${err}`);
        process.exit(1);
    });
