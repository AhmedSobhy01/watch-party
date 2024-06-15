const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socketIO = require("socket.io");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const server = app.listen(port, (err) => {
    console.log(`API listening on port ${port}.`);
    if (err) throw err;
});

const io = socketIO(server, { cors: true, origins: "*:*" });

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log("MongoDB connected."));

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/room", require("./routes/room"));

// Non-existing routes handler
app.use((req, res, next) => res.status(404).send("404 Not Found"));

// Socket.io events
const users = {};

const getRoomUsers = (roomCode) => {
    let roomUsers = {};
    for (const [key, value] of Object.entries(users)) if (value.roomCode == roomCode) roomUsers[key] = users[key];

    return roomUsers;
};

io.on("connection", (socket) => {
    socket.on("new-user-joined", (data) => {
        users[socket.id] = { username: data.username, roomCode: data.roomCode };
        socket.join(data.roomCode);

        const roomUsers = getRoomUsers(data.roomCode);

        io.in(data.roomCode).emit("user-joined", { username: data.username, members: Object.keys(roomUsers).length });
    });

    socket.on("player-control", (data) => socket.to(users[socket.id].roomCode).emit("player-update", { message: data.message, context: data.context, username: users[socket.id].username, isPlaying: data.isPlaying }));

    socket.on("send-message", (message) => socket.to(users[socket.id].roomCode).emit("new-message", { message: message, username: users[socket.id].username }));

    socket.on("send-emoji", (emoji) => io.in(users[socket.id].roomCode).emit("new-emoji", { emoji: emoji, username: users[socket.id].username }));

    socket.on("leave-room", () => {
        const data = users[socket.id];
        delete users[socket.id];

        if (!data) return;

        const roomUsers = getRoomUsers(data.roomCode);

        // Delete room if no users are left
        if (Object.keys(roomUsers).length === 0) {
            const Room = require("./models/Room");
            Room.deleteOne({ roomCode: data.roomCode }, (err) => {
                if (err) console.log(err);
            });
        }

        socket.to(data.roomCode).emit("user-left", { username: data.username, members: Object.keys(roomUsers).length });
    });

    socket.on("disconnect", () => {
        const data = users[socket.id];
        delete users[socket.id];

        if (!data) return;

        const roomUsers = getRoomUsers(data.roomCode);

        // Delete room if no users are left
        if (Object.keys(roomUsers).length === 0) {
            const Room = require("./models/Room");
            Room.deleteOne({ roomCode: data.roomCode }, (err) => {
                if (err) console.log(err);
            });
        }

        socket.to(data.roomCode).emit("user-left", { username: data.username, members: Object.keys(roomUsers).length });
    });
});
