const router = require("express").Router();
const Room = require("../models/Room");

router.post("/create", async (req, res) => {
    if (!req.body.roomName || !req.body.roomCode || !req.body.roomType || !req.body.files || typeof req.body.files !== "object") return res.status(400).send({ message: "Please fill all the fields" });

    let { roomName, roomCode, roomType, files } = req.body;

    roomCode = roomCode.replace(/\s/g, "");

    const existingRoom = await Room.findOne({ roomCode });
    if (existingRoom) return res.status(400).send({ message: "Room code already exists" });

    let room;

    if (roomType == "online") {
        const videoFiles = files.filter((file) => file.type === "video" && file.url).map((file) => ({ type: "video", url: file.url }));
        const captionFiles = files.filter((file) => file.type === "caption" && file.label && file.url).map((file) => ({ type: "caption", label: file.label, url: file.url }));

        if (videoFiles.length === 0) return res.status(400).send({ message: "One video file is required" });

        room = Room({
            roomName,
            roomCode,
            roomType,
            files: [...videoFiles, ...captionFiles],
        });
    } else {
        const videoLength = files[0]?.length;

        if (!videoLength) return res.status(400).send({ message: "Video file is required" });

        room = Room({
            roomName,
            roomCode,
            roomType,
            files: [{ type: "video", length: videoLength }],
        });
    }

    room.save();

    res.send({ message: "success", roomCode: roomCode });
});

router.post("/join", (req, res) => {
    const { roomCode } = req.body;

    if (!roomCode) return res.status(400).send({ message: "Please fill all the fields" });

    Room.findOne({ roomCode }).then((room) => {
        if (!room) {
            res.send({
                message: "Room not found.",
            });
        } else {
            res.send({
                message: "success",
                room: {
                    name: room.roomName,
                    code: room.roomCode,
                    type: room.roomType,
                    files: room.files,
                },
            });
        }
    });
});

module.exports = router;
