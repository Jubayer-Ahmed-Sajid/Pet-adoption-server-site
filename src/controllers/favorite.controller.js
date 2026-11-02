const { ObjectId } = require("../config/db");

/**
 * Add a pet to user's favorites list.
 */
const addFavorite = async (req, res) => {
  try {
    const favorites = req.body;
    const result = await req.collections.favorites.insertOne(favorites);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Remove a pet from user's favorites list.
 */
const removeFavorite = async (req, res) => {
  const { id } = req.params;
  try {
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch (e) {
      query = { _id: id };
    }
    const result = await req.collections.favorites.deleteOne(query);
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid favorite ID format" });
  }
};

/**
 * Get all favorites for a specific user email.
 */
const getFavoritesByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};
    const result = await req.collections.favorites.find(query).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesByEmail,
};

