const mongoose = require("mongoose");

// Single mongoose connection. Returns the underlying native MongoDB `Db` instance
// (mongoose.connection.db) so existing raw `db.collection(...)` call sites keep working
// unchanged, while Mongoose models (backend/models/*.js) share the same connection.
async function connectDB() {
  mongoose.connection.on('connected', () => console.log("Database connected"));

  try {
    // MONGO_URI has no database name in its path — must be set explicitly,
    // otherwise mongoose silently defaults to a database called "test".
    await mongoose.connect(process.env.MONGO_URI, { dbName: "users" });
    return mongoose.connection.db;
  } catch (error) {
    console.error("Error connecting to DB:", error);
    throw error;
  }
}

module.exports = connectDB;