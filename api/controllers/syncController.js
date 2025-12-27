const Room = require("../models/Room");

const syncController = (io, socket) => {
    const getRoomMembersCount = (roomCode) => {
        const room = io.sockets.adapter.rooms.get(roomCode);
        return room ? room.size : 0;
    };

    const getRoomMembers = async (roomCode) => {
        const room = io.sockets.adapter.rooms.get(roomCode);
        if (!room) return [];

        const members = [];
        for (const socketId of room) {
            const s = io.sockets.sockets.get(socketId);
            if (s && s.data.username)
                members.push(s.data.username);

        }
        return members;
    };

    socket.on("new-user-joined", async (data) => {
        if (!data.roomCode || !data.username || socket.data.roomCode) return;

        const room = await Room.findOne({ roomCode: data.roomCode });

        if (!room) return;

        socket.join(data.roomCode);

        socket.data.username = data.username;
        socket.data.roomCode = room.roomCode;

        const roomMembersCount = getRoomMembersCount(data.roomCode);
        const roomMembers = await getRoomMembers(data.roomCode);
        io.to(data.roomCode).emit("user-joined", {
            username: data.username,
            members: roomMembersCount,
            membersList: roomMembers,
        });

        if (roomMembersCount > 1)
            socket.to(data.roomCode).emit("request-video-state", {
                requestingSocketId: socket.id,
            });
    });

    socket.on("video-state-response", (data) => {
        if (!socket.data.roomCode || !data.requestingSocketId) return;

        io.to(data.requestingSocketId).emit("sync-video-state", {
            currentTime: data.currentTime,
            isPlaying: data.isPlaying,
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

        const roomMembers = await getRoomMembers(roomCode);
        socket.to(roomCode).emit("user-left", {
            username,
            members: roomMembersCount,
            membersList: roomMembers,
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

        const roomMembers = await getRoomMembers(roomCode);
        socket.to(roomCode).emit("user-left", {
            username,
            members: roomMembersCount,
            membersList: roomMembers,
        });
    });
};

module.exports = syncController;
