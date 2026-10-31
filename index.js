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
const stripeKey =
  process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_GATEWAY_SECRET;
const stripe = stripeKey ? require("stripe")(stripeKey) : null;

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

app.get("/", async (req, res) => {
  res.send("Paws & Hearts Pet Adoption API is running");
});

async function run() {
  try {
    const petCollection = client.db("petsDB").collection("pets");
    const donationCollection = client.db("petsDB").collection("donations");
    const usersCollection = client.db("petsDB").collection("users");
    const requestedCollection = client.db("petsDB").collection("requested");
    const favoriteCollection = client.db("petsDB").collection("favorites");
    const eventsCollection = client.db("petsDB").collection("events");
    const paymentsCollection = client.db("petsDB").collection("payments");

    // Asynchronously connect to MongoDB without crashing Express route listeners
    client
      .connect()
      .then(() => {
        console.log("Successfully connected to MongoDB deployment!");
      })
      .catch((err) => {
        console.warn(
          "MongoDB connection notice (resume cluster in cloud.mongodb.com or update MONGODB_URI):",
          err.message
        );
      });

    // JWT Token Generation
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || "default_jwt_secret", {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        })
        .send({ success: true });
    });

    // Verification Middleware
    const verifyToken = async (req, res, next) => {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).send({ message: "unauthorized" });
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_jwt_secret", (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "bad request" });
        }
        if (decoded) {
          req.user = decoded;
          next();
        }
      });
    };

    // Payments API
    app.post("/payments", async (req, res) => {
      const paymentInfo = req.body;
      const result = await paymentsCollection.insertOne(paymentInfo);
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(Number(price) * 100, 10);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.max(50, amount),
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });

    // Pets API
    app.get("/pets", async (req, res) => {
      const result = await petCollection.find().toArray();
      res.send(result);
    });

    app.get("/pets/search", async (req, res) => {
      const { name } = req.query;
      const query = name ? { name: { $regex: name, $options: "i" } } : {};
      const result = await petCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/pets", async (req, res) => {
      const pet = req.body;
      const result = await petCollection.insertOne(pet);
      res.send(result);
    });

    app.get("/pets/:category", async (req, res) => {
      const { category } = req.params;
      const result = await petCollection.find({ category }).toArray();
      res.send(result);
    });

    app.get("/pets/id/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await petCollection.findOne(query);
      res.send(result);
    });

    app.patch("/pets/:id", async (req, res) => {
      const { id } = req.params;
      const updatedPet = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          name: updatedPet.name,
          age: updatedPet.age,
          pet_location: updatedPet.pet_location,
          image: updatedPet.image,
          short_description: updatedPet.short_description,
          long_description: updatedPet.long_description,
          category: updatedPet.category,
          adopted: updatedPet.adopted,
          email: updatedPet.email,
          AddedDate: updatedPet.AddedDate,
        },
      };
      const result = await petCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.get("/addedpets", async (req, res) => {
      const email = req.query?.email;
      const result = await petCollection.find({ email }).toArray();
      res.send(result);
    });

    app.delete("/pets/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await petCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/pets/admin/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          adopted: true,
        },
      };
      const result = await petCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Events API
    app.get("/pet/special/events", async (req, res) => {
      const result = await eventsCollection.find().toArray();
      res.send(result);
    });

    // Favorites API
    app.post("/pets/favorites", async (req, res) => {
      const favorites = req.body;
      const result = await favoriteCollection.insertOne(favorites);
      res.send(result);
    });

    app.delete("/pets/favorites/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await favoriteCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/pets/favorites/email", async (req, res) => {
      const { email } = req.query;
      const result = await favoriteCollection.find({ email }).toArray();
      res.send(result);
    });

    // Donations API
    app.get("/donations", async (req, res) => {
      const result = await donationCollection.find().toArray();
      res.send(result);
    });

    app.delete("/donations/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await donationCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/donations/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await donationCollection.findOne(query);
      res.send(result);
    });

    app.patch("/donations/:id", async (req, res) => {
      const { id } = req.params;
      const updatedCampaign = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          max_donation_amount: updatedCampaign.max_donation_amount,
          last_date: updatedCampaign.last_date,
          image: updatedCampaign.image,
          short_description: updatedCampaign.short_description,
          long_description: updatedCampaign.long_description,
          email: updatedCampaign.email,
          AddedDate: updatedCampaign.AddedDate,
        },
      };
      const result = await donationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch("/donations/update/:id", async (req, res) => {
      const { id } = req.params;
      const { donatedAmount } = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $inc: {
          donated_amount: Number(donatedAmount) || 0,
        },
      };
      const result = await donationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.get("/addedDonations", async (req, res) => {
      const email = req.query.email;
      const result = await donationCollection.find({ email }).toArray();
      res.send(result);
    });

    app.post("/donations", async (req, res) => {
      const campaign = req.body;
      const result = await donationCollection.insertOne(campaign);
      res.send(result);
    });

    // Adoption Request API
    app.post("/adoption/request", async (req, res) => {
      const requestedInfo = req.body;
      const result = await requestedCollection.insertOne(requestedInfo);
      res.send(result);
    });

    app.get("/adoption/request", async (req, res) => {
      const email = req.query.email;
      const result = await requestedCollection.find({ email }).toArray();
      res.send(result);
    });

    app.put("/adoption/request/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "adopted",
        },
      };
      const result = await requestedCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    app.patch("/adoption/request", async (req, res) => {
      const { id } = req.query;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          adopted: true,
        },
      };
      const result = await petCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/adoption/request/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await requestedCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/adoption/request/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await requestedCollection.findOne(query);
      res.send(result);
    });

    // Users API
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          isAdmin: true,
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      res.send(result);
    });
  } finally {
    // Keep connection alive
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
