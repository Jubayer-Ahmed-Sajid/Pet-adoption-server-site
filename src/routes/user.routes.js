const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserAdminStatus,
  makeAdmin,
  deleteUser,
} = require("../controllers/user.controller");
const { ensureDB } = require("../middlewares/db.middleware");

// Specific routes first
router.get("/users/admin/:email", ensureDB, getUserAdminStatus);
router.patch("/users/admin/:id", ensureDB, makeAdmin);

// General user collection
router.get("/users", ensureDB, getAllUsers);
router.post("/users", ensureDB, createUser);

// User by ID modifications
router.patch("/users/:id", ensureDB, makeAdmin);
router.delete("/users/:id", ensureDB, deleteUser);

module.exports = router;

