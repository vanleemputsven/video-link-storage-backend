const mongoose = require("mongoose");


const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, 
  },
  description: {
    type: String, 
  },
  fileUrl: {
    type: String,
    required: true, 
  },
  views: {
    type: Number,
    default: 0, 
  },
  author: {
    type: String,
    default: "Onbekend", 
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
    // === NIEUW: commentaar-veld ===
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      userEmail: {
        type: String,
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});



module.exports = mongoose.model("Video", videoSchema);
