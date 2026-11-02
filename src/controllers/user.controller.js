const { ObjectId } = require("../config/db");

/**
 * Register or sync a user profile. Prevents duplicate registration.
 */
const createUser = async (req, res) => {
  try {
    const user = req.body;
    const query = { email: user.email };
    const existingUser = await req.collections.users.findOne(query);
    if (existingUser) {
      return res.send({ message: "user already exists", insertedId: null });
    }
    const result = await req.collections.users.insertOne(user);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all registered user profiles.
 */
const getAllUsers = async (req, res) => {
  try {
    const result = await req.collections.users.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Check admin status for a given email address.
 */
const getUserAdminStatus = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await req.collections.users.findOne({ email });
    const isAdmin = user?.role === "admin";
    res.send({ isAdmin, ...user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Promote user to admin role.
 */
const makeAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        role: "admin",
      },
    };
    const result = await req.collections.users.updateOne(filter, updatedDoc);
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid user ID format" });
  }
};

/**
 * Delete a user profile.
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await req.collections.users.deleteOne(query);
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid user ID format" });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserAdminStatus,
  makeAdmin,
  deleteUser,
};

