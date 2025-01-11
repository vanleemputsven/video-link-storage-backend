const dotenv = require("dotenv");
dotenv.config(); // Laad .env eerst

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); 
const videoRoutes = require("./routes/videoRoutes"); 
const authRoutes = require("./routes/authRoutes"); 
const favoriteRoutes = require("./routes/favoriteRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "https://video-link-storage.vercel.app"], // Vervang door jouw frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));
app.options("*", cors());
// Verbind met de database
connectDB();

// Gebruik video-routes
app.use("/api/videos", videoRoutes); 
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes); 

// Testroute
app.get("/", (req, res) => {
  res.send("Video Link Storage API draait!");
});

const errorHandler = require("./middelware/errorHandler");
app.use(errorHandler);

// Start de server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
