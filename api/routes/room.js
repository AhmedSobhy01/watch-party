const router = require("express").Router();
const roomController = require("../controllers/roomController");
const validationRules = require("../validators/roomValidator");

router.post("/create", validationRules.createRoomValidationRules, roomController.create);

router.post("/join", validationRules.joinRoomValidationRules, roomController.join);

module.exports = router;
