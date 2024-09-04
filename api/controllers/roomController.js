const { validationResult } = require("express-validator");
const Room = require("../models/Room");

const prepareCaptionFiles = (files) => files.filter((file) => file.type === "caption").map((file) => ({ type: "caption", label: file.label, url: file.url }));

const create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { roomName, roomCode, roomType, files } = req.body;

    const existingRoom = await Room.findOne({ roomCode });
    if (existingRoom) return res.status(400).send({ message: "Room code already exists" });

    let room;

    if (roomType === "online") {
        const videoFile = files.find((file) => file.type === "video");
        const captionFiles = prepareCaptionFiles(files);

        room = new Room({
            roomName,
            roomCode,
            roomType,
            files: [
                {
                    type: "video",
                    url: videoFile.url,
                },
                ...captionFiles,
            ],
        });
    } else {
        const videoFile = files.find((file) => file.type === "video");

        room = new Room({
            roomName,
            roomCode,
            roomType,
            files: [{ type: "video", length: videoFile.length }],
        });
    }

    await room.save();

    res.send({ message: "success", roomCode });
};

const join = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { roomCode } = req.body;

    const room = await Room.findOne({ roomCode });

    if (!room) return res.status(400).send({ message: "Room not found" });

    res.send({
        message: "success",
        room: {
            name: room.roomName,
            code: room.roomCode,
            type: room.roomType,
            files: room.files,
        },
    });
};

module.exports = {
    create,
    join,
};
