const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { env } = require("./config/env");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

// Global rejection logger for background connections
process.on("unhandledRejection", (reason) => {
  console.warn("MongoDB connection background notice:", reason?.message || reason);
});

const app = express();

// Security and CORS configuration
app.use(
  cors({
    origin: env.CLIENT_ORIGINS,
    credentials: true,
  })
);

// Body and Cookie Parsers
app.use(cookieParser());
app.use(express.json());

// API Base Root
app.get("/", (req, res) => {
  res.send("Paws & Hearts Pet Adoption API is running");
});

// Mount All Subsystem Routers
app.use(routes);

// 404 and Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
