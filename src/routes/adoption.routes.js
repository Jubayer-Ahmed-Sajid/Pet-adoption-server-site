const express = require("express");
const router = express.Router();
const {
  createAdoptionRequest,
  getAdoptionRequests,
  getAdoptionRequestById,
  updateAdoptionRequestStatus,
  markPetAdoptedFromRequest,
  deleteAdoptionRequest,
} = require("../controllers/adoption.controller");
const { ensureDB } = require("../middlewares/db.middleware");

router.post("/adoption/request", ensureDB, createAdoptionRequest);
router.get("/adoption/request", ensureDB, getAdoptionRequests);
router.patch("/adoption/request", ensureDB, markPetAdoptedFromRequest);
router.get("/adoption/request/:id", ensureDB, getAdoptionRequestById);
router.put("/adoption/request/:id", ensureDB, updateAdoptionRequestStatus);
router.delete("/adoption/request/:id", ensureDB, deleteAdoptionRequest);

module.exports = router;
