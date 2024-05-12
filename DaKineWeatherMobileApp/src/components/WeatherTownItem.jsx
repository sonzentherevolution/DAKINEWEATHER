import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import api from "../api/app"; // Assuming api is imported from a separate file

const TownWeatherItem = ({ town, city }) => {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (town) {
        const modifiedTownName = town.name.replace(/ʻ/g, "'"); // Replace ʻokina with apostrophe
        const encodedTownName = encodeURIComponent(modifiedTownName); // Encode the town name

        try {
          const response = await api.get(
            `/weather-by-town?townName=${encodedTownName}`
          );
          console.log("API Test Successful, response:", response);
          setWeatherData(response.data);
        } catch (error) {
          console.error("API Error:", error);
        }
      }
    };

    fetchWeather();
  }, [town]);

  const getWeatherStyles = (weather) => {
    switch (weather) {
      case "Clear":
        return styles.clearSky;
      case "Clouds":
        return styles.cloudy;
      case "Rain":
        return styles.rainy;
      case "Snow":
        return styles.snowy;
      case "Thunderstorm":
        return styles.thunderstorm;
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        styles.townContainer,
        weatherData ? getWeatherStyles(weatherData.weather[0].main) : {},
      ]}
    >
      <Text style={styles.townName}>{town.name}</Text>
      <Text style={styles.townDetails}>{town.vicinity}</Text>
      <Text style={styles.postalCode}>{town.postal}</Text>
      {weatherData && (
        <View>
          <Text style={styles.townDetails}>
            Temperature: {weatherData.main.temp}°C
          </Text>
          <Text style={styles.townDetails}>
            Weather: {weatherData.weather[0].description}
          </Text>
          {/* Displaying weather icon */}
          <Image
            style={styles.weatherIcon}
            source={{
              uri: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`,
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  townContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  townName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  townDetails: {
    fontSize: 14,
    color: "#666",
  },
  postalCode: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  clearSky: {
    backgroundColor: "#f7d26b",
  },
  cloudy: {
    backgroundColor: "#dfe0e5",
  },
  rainy: {
    backgroundColor: "#678f89",
  },
  snowy: {
    backgroundColor: "#a1c6ea",
  },
  thunderstorm: {
    backgroundColor: "#505b62",
  },
  weatherIcon: {
    width: 50,
    height: 50,
  },
});

export default TownWeatherItem;
