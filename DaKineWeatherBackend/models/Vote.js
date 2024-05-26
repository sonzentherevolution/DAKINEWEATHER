// models/Vote.js
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  userId: String,
  location: String,
  condition: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vote", voteSchema);
