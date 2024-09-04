const Room = require("../models/Room");

const syncController = (io, socket) => {
    const getRoomMembersCount = (roomCode) => {
        const room = io.sockets.adapter.rooms.get(roomCode);
        return room ? room.size : 0;
    };

    socket.on("new-user-joined", async (data) => {
        if (!data.roomCode || !data.username || socket.data.roomCode) return;

        const room = await Room.findOne({ roomCode: data.roomCode });

        if (!room) return;

        socket.join(data.roomCode);

        socket.data.username = data.username;
        socket.data.roomCode = room.roomCode;

        const roomMembersCount = getRoomMembersCount(data.roomCode);
        io.to(data.roomCode).emit("user-joined", {
            username: data.username,
            members: roomMembersCount,
        });
    });

    socket.on("player-control", (data) => {
        if (!socket.data.roomCode) return;

        socket.to(socket.data.roomCode).emit("player-update", {
            username: socket.data.username,
            message: data.message,
            currentTime: data.currentTime,
            isPlaying: data.isPlaying,
        });
    });

    socket.on("send-message", (message) => {
        if (!socket.data.roomCode || !message) return;

        socket.to(socket.data.roomCode).emit("new-message", {
            username: socket.data.username,
            message: message,
        });
    });

    socket.on("send-emoji", (emoji) => {
        if (!socket.data.roomCode || !emoji) return;

        io.in(socket.data.roomCode).emit("new-emoji", {
            username: socket.data.username,
            emoji: emoji,
        });
    });

    socket.on("leave-room", async () => {
        if (!socket.data.roomCode) return;

        const roomCode = socket.data.roomCode;
        const username = socket.data.username;

        delete socket.data.roomCode;
        delete socket.data.username;

        socket.leave(roomCode);

        const roomMembersCount = getRoomMembersCount(roomCode);

        if (roomMembersCount === 0) {
            await Room.deleteOne({ roomCode });
            return;
        }

        socket.to(roomCode).emit("user-left", {
            username,
            members: roomMembersCount,
        });
    });

    socket.on("disconnect", async () => {
        if (!socket.data.roomCode) return;

        const roomCode = socket.data.roomCode;
        const username = socket.data.username;

        delete socket.data.roomCode;
        delete socket.data.username;

        socket.leave(roomCode);

        const roomMembersCount = getRoomMembersCount(roomCode);

        if (roomMembersCount === 0) {
            await Room.deleteOne({ roomCode });
            return;
        }

        socket.to(roomCode).emit("user-left", {
            username,
            members: roomMembersCount,
        });
    });
};

module.exports = syncController;
