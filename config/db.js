const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database verbonden!");
  } catch (err) {
    console.error("Fout bij verbinden met database:", err.message);
    process.exit(1); // stop het proces bij een fout
  }
};

module.exports = connectDB; 
