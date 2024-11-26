const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

console.log("Cloudinary instance:", cloudinary.config());

// Stel opslag in met Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "video-link-storage", // Map in Cloudinary waar video's worden opgeslagen
    resource_type: "video", // Specificeer dat het om video's gaat
  },
});

// Exporteer Multer-configuratie
const upload = multer({ storage: storage });
console.log("Multer setup successful"); // Debugging
module.exports = upload;
