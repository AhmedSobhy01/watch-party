const syncController = require("../controllers/syncController");

const socketService = (server) => {
    const io = require("socket.io")(server, { cors: true, origins: "*:*" });

    return new Promise((resolve) => {
        io.on("connection", (socket) => {
            syncController(io, socket);
        });

        console.log("Socket.IO server started");

        resolve();
    });
};

module.exports = socketService;
