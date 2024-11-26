const dotenv = require("dotenv");
dotenv.config(); // Laad .env eerst

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); 
const videoRoutes = require("./routes/videoRoutes"); 
const authRoutes = require("./routes/authRoutes"); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Verbind met de database
connectDB();

// Gebruik video-routes
app.use("/api/videos", videoRoutes); 
app.use("/api/auth", authRoutes);

// Testroute
app.get("/", (req, res) => {
  res.send("Video Link Storage API draait!");
});

// Start de server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET);
