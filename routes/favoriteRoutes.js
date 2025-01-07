const express = require("express");
const User = require("../models/User");
const Video = require("../models/Video");
const authenticate = require("../middelware/authMiddelware"); // Zorg ervoor dat de pad correct is

const router = express.Router();

// Route: Voeg een video toe aan favorieten
router.post("/:videoId", authenticate(), async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id;

  try {
    // Controleer of de video bestaat
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video niet gevonden." });
    }

    // Voeg de video toe aan de favorieten als deze nog niet is toegevoegd
    const user = await User.findById(userId);
    if (user.favorites.includes(videoId)) {
      return res.status(400).json({ message: "Video is al in favorieten." });
    }

    user.favorites.push(videoId);
    await user.save();

    res.status(200).json({ message: "Video toegevoegd aan favorieten." });
  } catch (err) {
    res.status(500).json({ message: "Fout bij toevoegen aan favorieten.", error: err.message });
  }
});

// Route: Verwijder een video uit favorieten
router.delete("/:videoId", authenticate(), async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user.favorites.includes(videoId)) {
      return res.status(400).json({ message: "Video staat niet in favorieten." });
    }

    user.favorites = user.favorites.filter(id => id.toString() !== videoId);
    await user.save();

    res.status(200).json({ message: "Video verwijderd uit favorieten." });
  } catch (err) {
    res.status(500).json({ message: "Fout bij verwijderen uit favorieten.", error: err.message });
  }
});

// Route: Haal alle favoriete video's van een gebruiker op
router.get("/", authenticate(), async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate("favorites");
    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: "Fout bij ophalen van favorieten.", error: err.message });
  }
});

module.exports = router;
