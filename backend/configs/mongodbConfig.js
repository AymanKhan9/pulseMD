const { MongoClient } = require("mongodb");

let client;
let dbInstance;

async function connectDB() {
  if (dbInstance) {
    return dbInstance; // reuse existing connection
  }

  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    dbInstance = client.db("users");
    console.log("Connected to DB!");
    return dbInstance;
  } catch (error) {
    console.error("Error connecting to DB:", error);
    throw error; // don't swallow — let caller know it failed
  }
}

module.exports = connectDB;