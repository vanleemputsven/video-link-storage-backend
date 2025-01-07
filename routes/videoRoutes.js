const express = require("express");
const Video = require("../models/Video");
const authenticate = require("../middelware/authMiddelware");
const validateObjectId = require("../middelware/validateObjectId");
const upload = require("../config/multer");
const axios = require("axios");
const User = require("../models/User");


const router = express.Router();

// Route: Haal alle video's op (open voor alle geauthenticeerde gebruikers)
router.get("/", authenticate(), async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "Fout bij het ophalen van video's", error: err });
  }
});

// Route: Voeg een nieuwe video toe (inclusief upload naar Cloudinary)
router.post("/", authenticate("lecturer"), upload.single("video"), async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);

  const { title, description } = req.body;

  if (!title || !req.file) {
    return res
      .status(400)
      .json({ message: "Titel en video zijn verplicht." });
  }

  try {
    // Haal e-mailadres op van de ingelogde user, om in 'author' te zetten
    const user = await User.findById(req.user.id).select("email");
    if (!user) {
      return res.status(404).json({ message: "Gebruiker niet gevonden." });
    }

    const fileUrl = req.file.path; // Cloudinary-URL (via multer)
    console.log("Generated file URL:", fileUrl);

    const newVideo = new Video({
      title,
      description,
      fileUrl,
      author: user.email || "Onbekend", // Vul email in. Of pas dit aan voor user.naam, etc.
    });

    await newVideo.save();
    return res.status(201).json(newVideo);
  } catch (err) {
    console.error("Fout bij het toevoegen van de video:", err);
    return res
      .status(500)
      .json({ message: "Fout bij het toevoegen van de video", error: err.message });
  }
});

// Route: Zoek video's op titel of beschrijving (open voor alle geauthenticeerde gebruikers)
router.get("/search", authenticate(), async (req, res) => {
  const { query } = req.query; // Haal zoekterm op uit de querystring

  if (!query) {
    return res.status(400).json({ message: "Geef een zoekterm op." });
  }

  try {
    const videos = await Video.find({
      $or: [
        { title: { $regex: query, $options: "i" } }, // Zoek in titel (hoofdletterongevoelig)
        { description: { $regex: query, $options: "i" } }, // Zoek in beschrijving
      ],
    });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "Fout bij het zoeken naar video's.", error: err });
  }
});


// Route: Haal een specifieke video op (open voor alle geauthenticeerde gebruikers)
router.get("/:id", authenticate(), validateObjectId, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video niet gevonden." });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: "Fout bij het ophalen van de video.", error: err });
  }
});

// Route: Update een bestaande video (alleen voor docenten)
router.put("/:id", authenticate(), validateObjectId, async (req, res) => {
  const { title, description, fileUrl } = req.body;

  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video niet gevonden." });

    if (title) video.title = title;
    if (description) video.description = description;
    if (fileUrl) video.fileUrl = fileUrl;

    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: "Fout bij het bijwerken van de video.", error: err });
  }
});


// Route: Verwijder een video (alleen voor docenten)
router.delete("/:id", authenticate(), validateObjectId, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: "Video niet gevonden." });
    res.json({ message: "Video succesvol verwijderd." });
  } catch (err) {
    res.status(500).json({ message: "Fout bij het verwijderen van de video.", error: err });
  }
});

// Route: Verhoog het aantal views van een video (open voor alle geauthenticeerde gebruikers)
router.patch("/:id/views", authenticate(), async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video niet gevonden." });

    video.views += 1;
    await video.save();
    res.json({ message: "Aantal views verhoogd.", views: video.views });
  } catch (err) {
    res.status(500).json({ message: "Fout bij het bijwerken van views.", error: err });
  }
});


// Route: Haal de populairste video's op basis van views (NIEUW!)
router.get("/top-views", authenticate(), async (req, res) => {
  try {
    // Vind de 5 meest bekeken video's, gesorteerd op views dalend
    const topVideos = await Video.find().sort({ views: -1 }).limit(5);
    res.json(topVideos);
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Fout bij het ophalen van de populairste video's.",
        error: err.message,
      });
  }
});


// Haal alle reacties voor een bepaalde video op
router.get("/:id/comments", authenticate(), validateObjectId, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate("comments.user", "email role");
    if (!video) {
      return res.status(404).json({ message: "Video niet gevonden." });
    }

    // Stuur de gehele comments-array terug
    return res.json(video.comments);
  } catch (err) {
    console.error("Fout bij ophalen van comments:", err);
    return res
      .status(500)
      .json({ message: "Fout bij ophalen van comments.", error: err.message });
  }
});

// Voeg een reactie toe aan een bepaalde video
router.post("/:id/comments", authenticate(), validateObjectId, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Comment content is required." });
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video niet gevonden." });
    }

    // Gebruiker die comment toevoegt
    const user = await User.findById(req.user.id).select("email");
    if (!user) {
      return res.status(404).json({ message: "Gebruiker niet gevonden." });
    }

    video.comments.push({
      user: user._id,
      userEmail: user.email,
      content: content.trim(),
    });

    await video.save();
    return res.status(201).json({ message: "Reactie succesvol toegevoegd." });
  } catch (err) {
    console.error("Fout bij toevoegen van comment:", err);
    return res
      .status(500)
      .json({ message: "Fout bij toevoegen van comment.", error: err.message });
  }
});

router.delete(
  "/:id/comments/:commentId",
  authenticate(),
  validateObjectId,
  async (req, res) => {
    try {
      const video = await Video.findById(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video niet gevonden." });
      }

      // Zoek de reactie in de comments array
      const commentIndex = video.comments.findIndex(
        (c) => c._id.toString() === req.params.commentId
      );
      if (commentIndex < 0) {
        return res.status(404).json({ message: "Reactie niet gevonden." });
      }

      const comment = video.comments[commentIndex];

      // Check of de ingelogde user de eigenaar is, of dat hij lecturer is
      if (comment.user.toString() !== req.user.id && req.user.role !== "lecturer") {
        return res.status(403).json({
          message: "Je hebt geen toestemming om deze reactie te verwijderen.",
        });
      }

      // Verwijder de reactie uit de array
      video.comments.splice(commentIndex, 1);
      await video.save();

      return res.json({ message: "Reactie succesvol verwijderd." });
    } catch (err) {
      console.error("Fout bij verwijderen van comment:", err);
      return res.status(500).json({
        message: "Fout bij verwijderen van comment.",
        error: err.message,
      });
    }
  }
);







module.exports = router;
