require("dotenv").config(); // Ensure .env is loaded before anything else

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator"); // Ensure these are imported

const User = require("./models/User"); // Import the User model

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5001;
const kauaiRadius = 351011;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected to DAKINEWEATHER"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Endpoint for guest login
app.post("/guest-login", async (req, res) => {
  const ipAddress =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const guestId = uuidv4();

  const user = new User({ guestId, ipAddress });
  await user.save();

  res.json({ guestId });
});

// Endpoint for Google login
app.post("/google-login", async (req, res) => {
  const userInfo = req.body;

  console.log("Received user info:", userInfo);

  try {
    const { sub: googleId, email } = userInfo;

    // Find or create the user in the database
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email });
      await user.save();
    }

    // Generate a JWT for the user
    const userToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ userToken });
  } catch (error) {
    console.error("Google login error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint for voting
app.post("/vote", async (req, res) => {
  const { guestId, voteData } = req.body;
  const user = await User.findOne({ guestId });
  if (user) {
    user.votes.push(voteData);
    user.userScore += 1; // Update user score logic as needed
    await user.save();
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Guest user not found" });
  }
});

// Endpoint for fetching weather based on town name
app.get("/weather-by-town", async (req, res) => {
  let { townName } = req.query;
  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  const fallbackTownName = "Lihue"; // Example of another town to test
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${townName}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching weather data for ${townName}:`,
      error.response ? error.response.data : error.message
    );

    // Try fallback town if the first request fails
    if (error.response && error.response.status === 404) {
      console.log(`Trying fallback town: ${fallbackTownName}`);
      const fallbackApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${fallbackTownName}&appid=${apiKey}&units=metric`;

      try {
        const fallbackResponse = await axios.get(fallbackApiUrl);
        res.json(fallbackResponse.data);
      } catch (fallbackError) {
        console.error(
          `Error fetching weather data for fallback town ${fallbackTownName}:`,
          fallbackError.response
            ? fallbackError.response.data
            : fallbackError.message
        );
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: fallbackError.response
            ? fallbackError.response.data
            : fallbackError.message,
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.response ? error.response.data : error.message,
      });
    }
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
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${kauaiRadius}&key=${apiKey}`;

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
