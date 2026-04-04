const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/todo-app";

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

module.exports = connectDB;
