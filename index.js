const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

process.on("unhandledRejection", (reason) => {
  console.warn("MongoDB connection background notice:", reason?.message || reason);
});

const app = express();
const port = process.env.PORT || 5000;
const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_GATEWAY_SECRET;
let stripe = null;
if (stripeKey && !stripeKey.includes("your_stripe")) {
  try {
    stripe = require("stripe")(stripeKey);
  } catch (e) {
    console.warn("Stripe init skipped:", e.message);
  }
}

// CORS and Cookie Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://pawsandhearts.surge.sh",
      "https://pet-adaption-11a4b.web.app",
      "https://paws-and-hearts-js.vercel.app",
      /https:\/\/paws-and-hearts.*\.vercel\.app$/,
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

const uri =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqva6ft.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db = null;
let clientPromise = null;

async function getDB() {
  if (db) return db;
  if (!clientPromise) {
    clientPromise = client.connect().then(() => {
      console.log("Connected to MongoDB Atlas!");
      db = client.db("petsDB");
      return db;
    });
  }
  return clientPromise;
}

// Database connectivity middleware
const ensureDB = async (req, res, next) => {
  try {
    const database = await getDB();
    req.db = database;
    req.collections = {
      pets: database.collection("pets"),
      donations: database.collection("donations"),
      users: database.collection("users"),
      requested: database.collection("requested"),
      favorites: database.collection("favorites"),
      events: database.collection("events"),
      payments: database.collection("payments"),
      contacts: database.collection("contact_messages"),
    };
    next();
  } catch (err) {
    console.error("DB connection error:", err.message);
    res.status(503).json({ error: "Database connection failed", details: err.message });
  }
};

// Health Check
app.get("/", (req, res) => {
  res.send("Paws & Hearts Pet Adoption API is running");
});

app.get("/health", async (req, res) => {
  try {
    const database = await getDB();
    await database.command({ ping: 1 });
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "unhealthy", error: err.message });
  }
});

// Real Database Computed Stats API
app.get("/stats", ensureDB, async (req, res) => {
  try {
    const { pets, donations } = req.collections;
    const totalAvailable = await pets.countDocuments({ adopted: { $ne: true } });
    const totalRehomed = await pets.countDocuments({ adopted: true });

    const dogCount = await pets.countDocuments({ category: "dog", adopted: { $ne: true } });
    const catCount = await pets.countDocuments({ category: "cat", adopted: { $ne: true } });
    const birdCount = await pets.countDocuments({ category: "bird", adopted: { $ne: true } });
    const fishCount = await pets.countDocuments({ category: "fish", adopted: { $ne: true } });

    const allDonations = await donations.find().toArray();
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
});

// Contact Messages API
app.post("/contact-messages", ensureDB, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required." });
    }
    const result = await req.collections.contacts.insertOne({
      name: name || "Anonymous Visitor",
      email,
      subject: subject || "General Inquiry",
      message,
      createdAt: new Date(),
      status: "unread",
    });
    res.json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// JWT Token Generation
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(
    user,
    process.env.ACCESS_TOKEN_SECRET || "default_jwt_secret",
    { expiresIn: "1h" }
  );
  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
    .send({ success: true, token });
});

// Verification Middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = req.cookies.token;
  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  if (!token) {
    return res.status(401).send({ message: "unauthorized" });
  }
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET || "default_jwt_secret",
    (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "bad request" });
      }
      req.user = decoded;
      next();
    }
  );
};

// Payments API
app.post("/payments", ensureDB, async (req, res) => {
  const paymentInfo = req.body;
  const result = await req.collections.payments.insertOne(paymentInfo);
  res.send(result);
});

app.post("/create-payment-intent", async (req, res) => {
  const { price } = req.body;
  if (!stripe) {
    return res.status(503).json({ error: "Stripe not configured on this environment." });
  }
  const amount = parseInt(Number(price) * 100, 10);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.max(50, amount),
    currency: "usd",
    payment_method_types: ["card"],
  });
  res.send({ clientSecret: paymentIntent.client_secret });
});

// Pets API
app.get("/pets", ensureDB, async (req, res) => {
  const result = await req.collections.pets.find().toArray();
  res.send(result);
});

app.get("/pets/search", ensureDB, async (req, res) => {
  const { name } = req.query;
  const query = name ? { name: { $regex: name, $options: "i" } } : {};
  const result = await req.collections.pets.find(query).toArray();
  res.send(result);
});

app.post("/pets", ensureDB, async (req, res) => {
  const pet = req.body;
  // Normalize fields between legacy and new client payloads
  const normalizedPet = {
    name: pet.name || pet.pet_name,
    category: pet.category,
    age: Number(pet.age) || 1,
    pet_location: pet.pet_location,
    image: pet.image || pet.pet_image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    short_description: pet.short_description || "",
    long_description: pet.long_description || "",
    adopted: false,
    email: pet.email || pet.user_email,
    user_name: pet.user_name || "Foster Volunteer",
    AddedDate: pet.AddedDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: pet.health_status || "100% Vetted Health",
    traits: pet.traits || ["Vaccinated", "Socialized"],
  };
  const result = await req.collections.pets.insertOne(normalizedPet);
  res.send(result);
});

app.get("/pets/:category", ensureDB, async (req, res) => {
  const { category } = req.params;
  const result = await req.collections.pets.find({ category }).toArray();
  res.send(result);
});

app.get("/pets/id/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await req.collections.pets.findOne(query);
    if (!result) return res.status(404).json({ error: "Pet not found" });
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid pet ID format" });
  }
});

app.patch("/pets/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  const updatedPet = req.body;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      name: updatedPet.name || updatedPet.pet_name,
      age: updatedPet.age,
      pet_location: updatedPet.pet_location,
      image: updatedPet.image || updatedPet.pet_image,
      short_description: updatedPet.short_description,
      long_description: updatedPet.long_description,
      category: updatedPet.category,
      adopted: updatedPet.adopted,
      email: updatedPet.email,
    },
  };
  const result = await req.collections.pets.updateOne(filter, updatedDoc);
  res.send(result);
});

app.get("/addedpets", ensureDB, async (req, res) => {
  const email = req.query?.email;
  const result = await req.collections.pets.find({ email }).toArray();
  res.send(result);
});

app.delete("/pets/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const result = await req.collections.pets.deleteOne(query);
  res.send(result);
});

app.patch("/pets/admin/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      adopted: true,
    },
  };
  const result = await req.collections.pets.updateOne(filter, updatedDoc);
  res.send(result);
});

// Events API
app.get("/pet/special/events", ensureDB, async (req, res) => {
  const result = await req.collections.events.find().toArray();
  res.send(result);
});

// Favorites API
app.post("/pets/favorites", ensureDB, async (req, res) => {
  const favorites = req.body;
  const result = await req.collections.favorites.insertOne(favorites);
  res.send(result);
});

app.delete("/pets/favorites/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  let query;
  try {
    query = { _id: new ObjectId(id) };
  } catch (e) {
    query = { _id: id };
  }
  const result = await req.collections.favorites.deleteOne(query);
  res.send(result);
});

app.get("/pets/favorites/email", ensureDB, async (req, res) => {
  const { email } = req.query;
  const result = await req.collections.favorites.find({ email }).toArray();
  res.send(result);
});

// Donations API
app.get("/donations", ensureDB, async (req, res) => {
  const result = await req.collections.donations.find().toArray();
  res.send(result);
});

app.delete("/donations/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const result = await req.collections.donations.deleteOne(query);
  res.send(result);
});

app.get("/donations/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await req.collections.donations.findOne(query);
    if (!result) return res.status(404).json({ error: "Campaign not found" });
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid campaign ID" });
  }
});

app.patch("/donations/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  const updatedCampaign = req.body;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      pet_name: updatedCampaign.pet_name,
      max_donation_amount: updatedCampaign.max_donation_amount,
      donated_amount: updatedCampaign.donated_amount,
      last_date: updatedCampaign.last_date,
      image: updatedCampaign.image,
      short_description: updatedCampaign.short_description,
      long_description: updatedCampaign.long_description,
      status: updatedCampaign.status,
    },
  };
  const result = await req.collections.donations.updateOne(filter, updatedDoc);
  res.send(result);
});

app.get("/addedDonations", ensureDB, async (req, res) => {
  const email = req.query.email;
  const result = await req.collections.donations.find({ email }).toArray();
  res.send(result);
});

app.post("/donations", ensureDB, async (req, res) => {
  const campaign = req.body;
  const result = await req.collections.donations.insertOne(campaign);
  res.send(result);
});

// Adoption Request API
app.post("/adoption/request", ensureDB, async (req, res) => {
  const requestedInfo = {
    ...req.body,
    createdAt: new Date(),
    status: req.body.status || "pending",
  };
  const result = await req.collections.requested.insertOne(requestedInfo);
  res.send(result);
});

app.get("/adoption/request", ensureDB, async (req, res) => {
  const email = req.query.email;
  const query = email ? { $or: [{ email }, { requester_email: email }] } : {};
  const result = await req.collections.requested.find(query).toArray();
  res.send(result);
});

app.put("/adoption/request/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedDoc = {
    $set: {
      status: req.body.status || "adopted",
    },
  };
  const result = await req.collections.requested.updateOne(filter, updatedDoc, options);
  res.send(result);
});

app.patch("/adoption/request", ensureDB, async (req, res) => {
  const { id } = req.query;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      adopted: true,
    },
  };
  const result = await req.collections.pets.updateOne(filter, updatedDoc);
  res.send(result);
});

app.delete("/adoption/request/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const result = await req.collections.requested.deleteOne(query);
  res.send(result);
});

app.get("/adoption/request/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const result = await req.collections.requested.findOne(query);
  res.send(result);
});

// Users API
app.post("/users", ensureDB, async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const existingUser = await req.collections.users.findOne(query);
  if (existingUser) {
    return res.send({ message: "user already exists", insertedId: null });
  }
  const result = await req.collections.users.insertOne(user);
  res.send(result);
});

app.get("/users", ensureDB, async (req, res) => {
  const result = await req.collections.users.find().toArray();
  res.send(result);
});

app.patch("/users/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: "admin",
    },
  };
  const result = await req.collections.users.updateOne(filter, updatedDoc);
  res.send(result);
});

app.delete("/users/:id", ensureDB, async (req, res) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const result = await req.collections.users.deleteOne(query);
  res.send(result);
});

app.get("/users/admin/:email", ensureDB, async (req, res) => {
  const email = req.params.email;
  const user = await req.collections.users.findOne({ email });
  const isAdmin = user?.role === "admin";
  res.send({ isAdmin, ...user });
});

// Standalone listener for local dev
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
}

module.exports = app;
