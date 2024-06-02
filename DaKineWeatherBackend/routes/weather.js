const express = require("express");
const axios = require("axios");
const Weather = require("../models/Weather");
const Vote = require("../models/Vote");

const router = express.Router();

const VOTE_THRESHOLD = 3; // Set your threshold here

async function fetchWeatherData(location) {
  try {
    // Check the cache (database) first
    let cachedWeather = await Weather.findOne({ location }).sort({
      updatedAt: -1,
    });

    if (cachedWeather) {
      console.log(`Cache hit for ${location}`);
      cachedWeather.source = "cache"; // Adding a source attribute to indicate cache
      return cachedWeather;
    }

    // If not found in cache, fetch from API
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`
    );
    console.log(
      `Weather data fetched successfully for ${location} from API`,
      response.data
    );

    const weatherData = {
      location,
      condition: response.data.weather[0].main,
      temp: response.data.main.temp,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      icon: response.data.weather[0].icon,
      source: "api", // Adding a source attribute to indicate API
    };

    // Save fetched data to cache (database)
    const newWeather = new Weather(weatherData);
    await newWeather.save();

    return weatherData;
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

async function fetchConditionFromVotes(location) {
  try {
    const votes = await Vote.find({ location });
    const conditionCount = {};

    votes.forEach((vote) => {
      if (!conditionCount[vote.condition]) {
        conditionCount[vote.condition] = 0;
      }
      conditionCount[vote.condition] += 1;
    });

    const maxVotes = Math.max(...Object.values(conditionCount));
    if (maxVotes >= VOTE_THRESHOLD) {
      const aggregatedCondition = Object.keys(conditionCount).reduce((a, b) =>
        conditionCount[a] > conditionCount[b] ? a : b
      );
      return aggregatedCondition;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching condition from votes:", error);
    return null;
  }
}

router.get("/api/weather/:location", async (req, res) => {
  const location = decodeURIComponent(req.params.location).replace(/ʻ/g, "'");
  console.log(`Fetching weather data for location: ${location}`);

  try {
    let condition = await fetchConditionFromVotes(location);
    const weatherData = await fetchWeatherData(location);

    if (!weatherData) {
      return res.status(500).json({ error: "Failed to fetch weather data" });
    }

    const formattedWeatherData = {
      condition: condition || weatherData.condition,
      temp: weatherData.temp,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed,
      location: location,
      icon: weatherData.icon,
      source: weatherData.source, // Adding source to the response
    };

    console.log(`Rendered data source for ${location}: ${weatherData.source}`);

    res.json(formattedWeatherData);
  } catch (error) {
    console.error(`Failed to fetch weather data for ${location}:`, error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

router.get("/weather-by-town", async (req, res) => {
  let { townName } = req.query;
  const apiKey = process.env.OPEN_WEATHER_API_KEY;

  try {
    // First, check the database for votes
    let condition = await fetchConditionFromVotes(townName);

    // Fetch weather data from the external API for the temperature
    let weatherData = await fetchWeatherData(townName);

    // Save the fetched data to the database if not already present
    const existingWeather = await Weather.findOne({ location: townName });
    if (!existingWeather && weatherData.source === "api") {
      const newWeatherData = new Weather({
        location: townName,
        condition: weatherData.condition,
        temp: weatherData.temp,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        icon: weatherData.icon,
        source: "api", // Adding source attribute to indicate API
      });

      await newWeatherData.save();
    }

    // Use vote-based condition if available, otherwise use fetched condition
    const formattedWeatherData = {
      condition: condition || weatherData.condition,
      temp: weatherData.temp,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed,
      location: townName,
      icon: weatherData.icon,
      source: weatherData.source, // Indicate source of data
    };

    console.log(
      `Rendered data source for ${townName}: ${formattedWeatherData.source}`
    );

    res.json(formattedWeatherData);
  } catch (error) {
    console.error(
      `Error fetching weather data for ${townName}:`,
      error.response ? error.response.data : error.message
    );

    if (error.response && error.response.status === 404) {
      console.log(`Trying fallback town: Lihue`);
      try {
        const fallbackWeatherData = await fetchWeatherData("Lihue");
        if (fallbackWeatherData) {
          res.json(fallbackWeatherData);
        } else {
          res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        }
      } catch (fallbackError) {
        console.error(
          `Error fetching weather data for fallback town Lihue:`,
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
      weather.updatedAt = Date.now(); // Extend TTL by updating updatedAt
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
      weather.updatedAt = Date.now(); // Extend TTL by updating updatedAt
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
