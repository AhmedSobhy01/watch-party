const { body } = require("express-validator");

const createRoomValidationRules = [
    body("roomName").isString().withMessage("roomName must be a string").notEmpty().withMessage("Room name is required").trim().escape(),

    body("roomCode")
        .isString()
        .withMessage("Room code must be a string")
        .notEmpty()
        .withMessage("Room code is required")
        .customSanitizer((value) => value.replace(/\s/g, "")),

    body("roomType").isIn(["online", "offline"]).withMessage('Room type must be either "online" or "offline"'),

    body("files")
        .isArray()
        .withMessage("Files must be an array")
        .custom((files) => {
            if (files.length === 0) return false;

            const hasVideo = files.some((file) => file.type === "video");
            return hasVideo;
        })
        .withMessage("At least one video file is required")
        .custom((files, { req }) => {
            if (req.body.roomType === "offline" && files.length > 1) return false;

            return true;
        })
        .withMessage("Only one video file is allowed for offline rooms")
        .custom((files, { req }) => {
            if (req.body.roomType === "online") {
                return files.every((file) => {
                    if (file.type === "video") return typeof file.url === "string" && file.url.trim() !== "";
                    else if (file.type === "caption") return typeof file.url === "string" && file.url.trim() !== "" && typeof file.label === "string" && file.label.trim() !== "";

                    return false;
                });
            }

            return Number.isInteger(files[0].length) && files[0].length > 0; // For offline rooms to check if video length is a positive integer
        })
        .withMessage("Please fill all missing fields"),
];

const joinRoomValidationRules = [body("roomCode").isString().withMessage("Room code must be a string").notEmpty().withMessage("Room code is required").trim().escape()];

module.exports = {
    createRoomValidationRules,
    joinRoomValidationRules,
};
