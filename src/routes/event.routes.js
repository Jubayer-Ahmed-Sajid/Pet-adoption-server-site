const express = require("express");
const router = express.Router();
const { getSpecialEvents } = require("../controllers/event.controller");
const { ensureDB } = require("../middlewares/db.middleware");

router.get("/pet/special/events", ensureDB, getSpecialEvents);

module.exports = router;
