const express = require("express");
const axios = require("axios");
const Weather = require("../models/Weather");

const router = express.Router();

async function fetchWeatherData(location) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`
    );
    console.log(
      `Weather data fetched successfully for ${location}:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching weather data for ${location}:`,
      error.response ? error.response.data : error.message
    );
    if (error.response && error.response.status === 404) {
      console.log(`Trying fallback town: Lihue`);
      return fetchWeatherData("Lihue");
    } else {
      console.error(`Skipping weather data for ${location} due to error.`);
      return null;
    }
  }
}

router.get("/api/weather/:location", async (req, res) => {
  const location = decodeURIComponent(req.params.location).replace(/ʻ/g, "'");
  console.log(`Fetching weather data for location: ${location}`);

  try {
    const weatherData = await fetchWeatherData(location);
    if (weatherData) {
      const formattedWeatherData = {
        condition: weatherData.weather[0].main,
        temp: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        location: location,
      };
      res.json(formattedWeatherData);
    } else {
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  } catch (error) {
    console.error(`Failed to fetch weather data for ${location}:`, error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

router.get("/weather-by-town", async (req, res) => {
  let { townName } = req.query;
  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  const fallbackTownName = "Lihue";
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${townName.replace(
    /ʻ/g,
    "'"
  )}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching weather data for ${townName}:`,
      error.response ? error.response.data : error.message
    );

    if (error.response && error.response.status === 404) {
      console.log(`Trying fallback town: ${fallbackTownName}`);
      try {
        const fallbackWeatherData = await fetchWeatherData(fallbackTownName);
        if (fallbackWeatherData) {
          res.json(fallbackWeatherData);
        } else {
          res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        }
      } catch (fallbackError) {
        console.error(
          `Error fetching weather data for fallback town ${fallbackTownName}:`,
          fallbackError
        );
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    } else {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
});

router.post("/api/weather/upvote/:location", async (req, res) => {
  const location = decodeURIComponent(req.params.location).replace(/ʻ/g, "'");
  console.log(`Upvoting weather condition for location: ${location}`);
  try {
    let weather = await Weather.findOne({ location });
    if (weather) {
      console.log(`Current rank for ${location}: ${weather.rank}`);
      weather.rank += 1;
      await weather.save();
      console.log(`New rank for ${location}: ${weather.rank}`);
      res.json(weather);
    } else {
      console.log(`Weather data not found for location: ${location}`);
      res.status(404).json({ error: "Weather data not found" });
    }
  } catch (error) {
    console.error("Failed to upvote weather condition:", error);
    res.status(500).json({ error: "Failed to upvote weather condition" });
  }
});

router.post("/api/weather/select/:location", async (req, res) => {
  const { status } = req.body;
  const location = decodeURIComponent(req.params.location).replace(/ʻ/g, "'");
  console.log(
    `Selecting new weather status for location: ${location}, status: ${status}`
  );
  try {
    let weather = await Weather.findOne({ location });
    if (weather) {
      weather.condition = status;
      weather.rank += 1;
      await weather.save();
      console.log(
        `Weather status updated for ${location}: ${status}, new rank: ${weather.rank}`
      );
      res.json(weather);
    } else {
      console.log(`Weather data not found for location: ${location}`);
      res.status(404).json({ error: "Weather data not found" });
    }
  } catch (error) {
    console.error("Failed to update weather condition:", error);
    res.status(500).json({ error: "Failed to update weather condition" });
  }
});

module.exports = router;
