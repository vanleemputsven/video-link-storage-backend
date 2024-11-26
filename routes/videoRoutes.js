const express = require("express");
const Video = require("../models/Video");
const authenticate = require("../middelware/authMiddelware");
const validateObjectId = require("../middelware/validateObjectId");
const upload = require("../config/multer");

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
  const { title, description } = req.body;

  if (!title || !req.file) {
    return res.status(400).json({ message: "Titel en video zijn verplicht." });
  }

  try {
    const fileUrl = req.file.path; // Cloudinary-URL
    const newVideo = new Video({ title, description, fileUrl });
    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (err) {
    res.status(500).json({ message: "Fout bij het toevoegen van de video", error: err.message });
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


module.exports = router;
