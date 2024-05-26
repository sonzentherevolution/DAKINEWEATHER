const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
  location: String,
  condition: String,
  temp: Number,
  humidity: Number,
  windSpeed: Number,
  rank: { type: Number, default: 1 },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Weather", weatherSchema);
