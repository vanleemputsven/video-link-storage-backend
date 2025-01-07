const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

console.log("Cloudinary instance:", cloudinary.config());

// Stel opslag in met Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "video-link-storage", 
    resource_type: "video", 
  },
});

// Exporteer Multer-configuratie
const upload = multer({ storage: storage });
console.log("Multer setup successful"); // Debugging
module.exports = upload;
