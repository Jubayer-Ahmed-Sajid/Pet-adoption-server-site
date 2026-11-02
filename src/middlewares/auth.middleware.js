const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

/**
 * Middleware to verify JWT token from Authorization header or cookie.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = req.cookies?.token;

  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing authentication token" });
  }

  jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

/**
 * Middleware to verify that the authenticated user has an 'admin' role.
 * Requires verifyToken to be executed first, or ensureDB if checking database.
 */
const verifyAdmin = async (req, res, next) => {
  const email = req.user?.email;
  if (!email) {
    return res.status(401).json({ message: "Unauthorized: User not authenticated" });
  }

  try {
    const user = await req.collections.users.findOne({ email });
    const isAdmin = user?.role === "admin";
    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin privileges required" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Failed to verify administrator role" });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
};
