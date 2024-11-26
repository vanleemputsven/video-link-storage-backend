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
    process.exit(1); // Stop het proces bij een fout
  }
};

module.exports = connectDB; // Zorg ervoor dat connectDB correct wordt geëxporteerd
