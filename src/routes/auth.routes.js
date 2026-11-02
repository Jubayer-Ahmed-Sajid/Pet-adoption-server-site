const express = require("express");
const router = express.Router();
const { generateToken, logout } = require("../controllers/auth.controller");

router.post("/jwt", generateToken);
router.post("/logout", logout);

module.exports = router;

