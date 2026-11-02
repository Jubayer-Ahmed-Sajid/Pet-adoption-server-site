const dns = require("dns");

// Windows DNS fix for MongoDB SRV lookups
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore DNS override errors on non-supported platforms
}

require("dotenv").config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI:
    process.env.MONGODB_URI ||
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqva6ft.mongodb.net/?retryWrites=true&w=majority`,
  DB_NAME: process.env.DB_NAME || "petsDB",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "default_jwt_secret",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_GATEWAY_SECRET || "",
  CLIENT_ORIGINS: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://pawsandhearts.surge.sh",
    "https://pet-adaption-11a4b.web.app",
    "https://paws-and-hearts-js.vercel.app",
    /https:\/\/paws-and-hearts.*\.vercel\.app$/,
  ],
};

module.exports = { env };

