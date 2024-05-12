const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { check, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
app.use(cors());

const port = process.env.PORT || 5001;
const kauaiRadius = 351011;

// Endpoint for fetching weather based on town name
app.get("/weather-by-town", async (req, res) => {
  const { townName } = req.query;
  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${townName}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

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
      const places = response.data.results;

      // Perform reverse geocoding for each place to get detailed address information
      const placesWithZipCodes = await Promise.all(
        places.map(async (place) => {
          const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${place.geometry.location.lat},${place.geometry.location.lng}&key=${apiKey}`;
          const reverseGeocodeResponse = await axios.get(reverseGeocodeUrl);
          const addressComponents =
            reverseGeocodeResponse.data.results[0].address_components;
          const postalCodeComponent = addressComponents.find((component) =>
            component.types.includes("postal_code")
          );
          const postalCode = postalCodeComponent
            ? postalCodeComponent.long_name
            : "Unknown";

          // Return the place along with the postal code
          return { ...place, postalCode };
        })
      );

      res.json({ results: placesWithZipCodes });
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
