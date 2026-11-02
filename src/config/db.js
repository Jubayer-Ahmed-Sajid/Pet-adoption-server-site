const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { env } = require("./env");

const client = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let dbInstance = null;
let clientPromise = null;

/**
 * Returns a cached MongoDB database instance.
 * Reuses connection across serverless invocations and long-running processes.
 */
async function getDB() {
  if (dbInstance) return dbInstance;

  if (!clientPromise) {
    clientPromise = client
      .connect()
      .then((connectedClient) => {
        console.log("Connected to MongoDB Atlas!");
        dbInstance = connectedClient.db(env.DB_NAME);
        return dbInstance;
      })
      .catch((err) => {
        clientPromise = null;
        throw err;
      });
  }

  return clientPromise;
}

/**
 * Helper to get references to all standard database collections.
 */
async function getCollections() {
  const db = await getDB();
  return {
    pets: db.collection("pets"),
    donations: db.collection("donations"),
    users: db.collection("users"),
    requested: db.collection("requested"),
    favorites: db.collection("favorites"),
    events: db.collection("events"),
    payments: db.collection("payments"),
    contacts: db.collection("contact_messages"),
  };
}

module.exports = {
  client,
  getDB,
  getCollections,
  ObjectId,
};

