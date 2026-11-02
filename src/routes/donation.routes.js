const express = require("express");
const router = express.Router();
const {
  getAllDonations,
  getDonationById,
  createDonationCampaign,
  updateDonationCampaign,
  deleteDonationCampaign,
  getAddedDonations,
  createPaymentIntent,
  recordPayment,
} = require("../controllers/donation.controller");
const { ensureDB } = require("../middlewares/db.middleware");

// Specific routes first
router.get("/addedDonations", ensureDB, getAddedDonations);
router.get("/addeddonations", ensureDB, getAddedDonations);
router.post("/create-payment-intent", createPaymentIntent);
router.post("/payments", ensureDB, recordPayment);

// Campaign endpoints
router.get("/donations", ensureDB, getAllDonations);
router.post("/donations", ensureDB, createDonationCampaign);
router.get("/donations/:id", ensureDB, getDonationById);
router.patch("/donations/:id", ensureDB, updateDonationCampaign);
router.put("/donations/:id", ensureDB, updateDonationCampaign);
router.patch("/donations/update/:id", ensureDB, updateDonationCampaign);
router.delete("/donations/:id", ensureDB, deleteDonationCampaign);

module.exports = router;
