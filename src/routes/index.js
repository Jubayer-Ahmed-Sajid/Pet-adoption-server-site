const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const statsRoutes = require("./stats.routes");
const petRoutes = require("./pet.routes");
const favoriteRoutes = require("./favorite.routes");
const donationRoutes = require("./donation.routes");
const adoptionRoutes = require("./adoption.routes");
const userRoutes = require("./user.routes");
const eventRoutes = require("./event.routes");
const contactRoutes = require("./contact.routes");

// Mount sub-routers
router.use(authRoutes);
router.use(statsRoutes);
router.use(petRoutes);
router.use(favoriteRoutes);
router.use(donationRoutes);
router.use(adoptionRoutes);
router.use(userRoutes);
router.use(eventRoutes);
router.use(contactRoutes);

module.exports = router;
