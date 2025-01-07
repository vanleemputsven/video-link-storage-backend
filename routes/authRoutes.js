const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
console.log(User);
const router = express.Router();
console.log("Path to User model resolved:", require.resolve("../models/User"));

// Validatie functie
const validateInput = (email, password) => {
  if (!email || !password) {
    return "E-mail en wachtwoord zijn verplicht.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "E-mailadres is niet geldig.";
  }
  if (password.length < 6) {
    return "Wachtwoord moet minimaal 6 tekens bevatten.";
  }
  return null;
};

// Route: Registreer een nieuwe gebruiker
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  // Validatie van input
  const validationError = validateInput(email, password);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    // Controleer of de gebruiker al bestaat
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "E-mailadres is al in gebruik." });
    }

    // Maak een nieuwe gebruiker
    const user = new User({ email, password, role });
    await user.save();

    res.status(201).json({ message: "Gebruiker succesvol geregistreerd." });
  } catch (err) {
    res.status(500).json({ message: "Fout bij registratie.", error: err.message });
  }
});

// Route: Login een gebruiker
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validatie van input
  const validationError = validateInput(email, password);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    // Zoek de gebruiker in de database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Ongeldig e-mailadres of wachtwoord." });
    }

    // Controleer het wachtwoord
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Ongeldig e-mailadres of wachtwoord." });
    }

    // Genereer een JWT-token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token is 1 uur geldig
    );

    res.json({ message: "Succesvol ingelogd.", token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Fout bij inloggen.", error: err.message });
  }
});



/* ===========================
   NIEUW: beheer-account-routes
   =========================== */
   const authenticate = require("../middelware/authMiddelware");

   // Route: Wijzig het eigen wachtwoord
   router.put("/manage/password", authenticate(), async (req, res) => {
     try {
       const userId = req.user.id;
       const { newPassword } = req.body;
   
       if (!newPassword || newPassword.length < 6) {
         return res
           .status(400)
           .json({ message: "Nieuw wachtwoord moet minimaal 6 tekens hebben." });
       }
   
       const user = await User.findById(userId);
       if (!user) {
         return res.status(404).json({ message: "Gebruiker niet gevonden." });
       }
   
       // Update het wachtwoord
       user.password = newPassword;
       await user.save();
   
       res.json({ message: "Wachtwoord succesvol gewijzigd." });
     } catch (err) {
       res
         .status(500)
         .json({ message: "Fout bij wijzigen van wachtwoord.", error: err.message });
     }
   });
   
   // Route: Verwijder het eigen account
   router.delete("/manage/account", authenticate(), async (req, res) => {
     try {
       const userId = req.user.id;
   
       const user = await User.findById(userId);
       if (!user) {
         return res.status(404).json({ message: "Gebruiker niet gevonden." });
       }
   
       await user.remove();
       res.json({ message: "Account succesvol verwijderd." });
     } catch (err) {
       res
         .status(500)
         .json({ message: "Fout bij verwijderen van account.", error: err.message });
     }
   });


   router.get("/manage/account-data", authenticate(), async (req, res) => {
    try {
      const userId = req.user.id;
      // Haal user op, sluit password en __v uit:
      const user = await User.findById(userId).select("-password -__v");
      if (!user) {
        return res.status(404).json({ message: "Gebruiker niet gevonden." });
      }
  
      // Stuur de user-data terug als JSON
      res.json(user);
    } catch (err) {
      res.status(500).json({
        message: "Fout bij het ophalen van accountgegevens.",
        error: err.message,
      });
    }
  });


module.exports = router;
