const express = require("express");
const axios = require("axios");
const cors = require("cors"); // Import CORS middleware
const { check, validationResult } = require("express-validator"); // Validation middleware
require("dotenv").config();

const app = express();
app.use(cors()); // Enable CORS for all routes

const port = process.env.PORT || 5001;
const kauaiRadius = 351011;

// Endpoint for fetching nearby places
app.get(
  "/nearby-places",
  [
    check("latitude").isFloat({ min: -90, max: 90 }), // Validate latitude
    check("longitude").isFloat({ min: -180, max: 180 }), // Validate longitude
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${kauaiRadius}&type=locality&key=${apiKey}`;

    try {
      const response = await axios.get(apiUrl);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching nearby places:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

// Endpoint for text-based search of towns
app.get(
  "/towns-search",
  [
    check("query").notEmpty().withMessage("Query parameter is required"), // Ensure query is not empty
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

    try {
      const response = await axios.get(apiUrl);
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching places:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
