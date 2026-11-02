const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

/**
 * Generate a signed JWT token and set httpOnly cookie.
 */
const generateToken = async (req, res) => {
  try {
    const user = req.body;
    const token = jwt.sign(user, env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      })
      .send({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate authentication token" });
  }
};

/**
 * Clear authentication token cookie on logout.
 */
const logout = async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
    .json({ success: true, message: "Logged out successfully" });
};

module.exports = {
  generateToken,
  logout,
};

