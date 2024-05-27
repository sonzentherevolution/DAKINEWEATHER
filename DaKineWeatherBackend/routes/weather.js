const express = require("express");
const axios = require("axios");
const Weather = require("../models/Weather");
const Vote = require("../models/Vote");

const router = express.Router();

const VOTE_THRESHOLD = 3; // Set your threshold here

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
      condition: condition || weatherData.weather[0].main,
      temp: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      location: location,
      icon: weatherData.weather[0].icon,
    };

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
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${townName.replace(
        /ʻ/g,
        "'"
      )}&appid=${apiKey}&units=metric`
    );
    const weatherData = response.data;

    // Save the fetched data to the database if not already present
    const existingWeather = await Weather.findOne({ location: townName });
    if (!existingWeather) {
      const newWeatherData = new Weather({
        location: townName,
        condition: weatherData.weather[0].main,
        temp: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        icon: weatherData.weather[0].icon,
      });

      await newWeatherData.save();
    }

    // Use vote-based condition if available, otherwise use fetched condition
    const formattedWeatherData = {
      condition: condition || weatherData.weather[0].main,
      temp: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      location: townName,
      icon: weatherData.weather[0].icon,
    };

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
