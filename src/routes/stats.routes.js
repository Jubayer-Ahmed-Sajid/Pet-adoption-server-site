const express = require("express");
const router = express.Router();
const { getHealth, getPlatformStats } = require("../controllers/stats.controller");
const { ensureDB } = require("../middlewares/db.middleware");

router.get("/health", getHealth);
router.get("/stats", ensureDB, getPlatformStats);

module.exports = router;

