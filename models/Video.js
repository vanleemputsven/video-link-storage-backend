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
  createdAt: {
    type: Date,
    default: Date.now, 
  },
});


module.exports = mongoose.model("Video", videoSchema);
