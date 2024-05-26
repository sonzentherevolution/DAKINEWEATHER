const express = require("express");
const axios = require("axios");
const { check, validationResult } = require("express-validator");

const router = express.Router();

router.get(
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
    const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=locality&location=${latitude},${longitude}&radius=50000&key=${apiKey}`;

    try {
      const response = await axios.get(apiUrl);
      const places = response.data.results;

      res.json({ results: places });
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

module.exports = router;
