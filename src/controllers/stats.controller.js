const { getDB } = require("../config/db");

/**
 * Health check endpoint verifying DB connectivity.
 */
const getHealth = async (req, res) => {
  try {
    const database = await getDB();
    await database.command({ ping: 1 });
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "unhealthy", error: err.message });
  }
};

/**
 * Compute real platform statistics directly from the database.
 */
const getPlatformStats = async (req, res) => {
  try {
    const { pets, donations } = req.collections;

    const [totalAvailable, totalRehomed, dogCount, catCount, birdCount, fishCount, allDonations] =
      await Promise.all([
        pets.countDocuments({ adopted: { $ne: true } }),
        pets.countDocuments({ adopted: true }),
        pets.countDocuments({ category: "dog", adopted: { $ne: true } }),
        pets.countDocuments({ category: "cat", adopted: { $ne: true } }),
        pets.countDocuments({ category: "bird", adopted: { $ne: true } }),
        pets.countDocuments({ category: "fish", adopted: { $ne: true } }),
        donations.find().toArray(),
      ]);

    const totalRaised = allDonations.reduce(
      (sum, d) => sum + (Number(d.donated_amount) || 0),
      0
    );

    res.json({
      totalAvailable,
      totalRehomed,
      totalRaised,
      categories: {
        dog: dogCount,
        cat: catCount,
        bird: birdCount,
        fish: fishCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getHealth,
  getPlatformStats,
};
