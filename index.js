const app = require("./src/app");
const { env } = require("./src/config/env");

// Standalone listener for local development
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`🐾 Paws & Hearts API Server running on port ${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
  });
}

module.exports = app;
