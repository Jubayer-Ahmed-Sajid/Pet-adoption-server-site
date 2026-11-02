const express = require("express");
const router = express.Router();
const {
  createContactMessage,
  getContactMessages,
} = require("../controllers/contact.controller");
const { ensureDB } = require("../middlewares/db.middleware");

router.post("/contact-messages", ensureDB, createContactMessage);
router.get("/contact-messages", ensureDB, getContactMessages);

module.exports = router;
