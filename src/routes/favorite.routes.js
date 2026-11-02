const express = require("express");
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  getFavoritesByEmail,
} = require("../controllers/favorite.controller");
const { ensureDB } = require("../middlewares/db.middleware");

// Specific route before parameter
router.get("/pets/favorites/email", ensureDB, getFavoritesByEmail);
router.post("/pets/favorites", ensureDB, addFavorite);
router.delete("/pets/favorites/:id", ensureDB, removeFavorite);

module.exports = router;

