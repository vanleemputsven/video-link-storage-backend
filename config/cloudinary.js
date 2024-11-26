const cloudinary = require("cloudinary").v2;

// Configuratie van Cloudinary met de .env-variabelen
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



console.log("Cloudinary Configuration:", cloudinary.config());

module.exports = cloudinary;