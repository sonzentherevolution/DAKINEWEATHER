const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
  location: String,
  condition: String,
  temp: Number,
  humidity: Number,
  windSpeed: Number,
  rank: { type: Number, default: 1 },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }, // No TTL on this field
});

// Ensure an index is created on updatedAt with a TTL of 1 hour
weatherSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model("Weather", weatherSchema);
