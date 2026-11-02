const { getDB, getCollections } = require("../config/db");

/**
 * Middleware ensuring MongoDB is connected and attaching DB collections to the request.
 */
const ensureDB = async (req, res, next) => {
  try {
    const database = await getDB();
    req.db = database;
    req.collections = await getCollections();
    next();
  } catch (err) {
    console.error("Database connection failure:", err.message);
    res.status(503).json({
      error: "Database connection failed",
      details: err.message,
    });
  }
};

module.exports = { ensureDB };

