const jwt = require("jsonwebtoken");

const authenticate = (requiredRole) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Haal token uit de header

    if (!token) {
      return res.status(401).json({ message: "Geen token aanwezig, toegang geweigerd." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifieer de token
      req.user = decoded; // Voeg de payload toe aan het verzoekobject

      // Controleer de rol als requiredRole is opgegeven
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ message: "Toegang geweigerd, onvoldoende rechten." });
      }

      next(); // Ga door naar de volgende middleware of route-handler
    } catch (err) {
      res.status(401).json({ message: "Ongeldige token, toegang geweigerd." });
    }
  };
};

module.exports = authenticate; // Exporteer de middleware
