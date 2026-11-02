const express = require("express");
const router = express.Router();
const {
  getAllPets,
  searchPets,
  getPetsByCategory,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getAddedPets,
  markAdoptedAdmin,
} = require("../controllers/pet.controller");
const { ensureDB } = require("../middlewares/db.middleware");

// Specific routes first
router.get("/pets/search", ensureDB, searchPets);
router.get("/pets/id/:id", ensureDB, getPetById);
router.get("/addedpets", ensureDB, getAddedPets);
router.patch("/pets/admin/:id", ensureDB, markAdoptedAdmin);

// General collections
router.get("/pets", ensureDB, getAllPets);
router.post("/pets", ensureDB, createPet);

// Category parameter
router.get("/pets/:category", ensureDB, getPetsByCategory);

// Direct pet ID updates & deletion
router.patch("/pets/:id", ensureDB, updatePet);
router.put("/pets/:id", ensureDB, updatePet);
router.delete("/pets/:id", ensureDB, deletePet);

module.exports = router;
