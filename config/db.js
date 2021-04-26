const mongoose = require("mongoose");
const db = process.env.MONGO_URI;

const connnectDB = async () => {
  try {
    console.log("Attempting DB connection...");
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("MongoDB connected...");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = connnectDB;
