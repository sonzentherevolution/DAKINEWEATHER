import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { fetchWeather } from "../api";

const WeatherTownItem = ({ town, navigation, updateWeatherData }) => {
  const [weatherData, setWeatherData] = useState(null);

  console.log("Rendering WeatherTownItem:", town.name); // Check if the component is being rendered

  useEffect(() => {
    const downloadWeather = async (town) => {
      try {
        const weather = await fetchWeather(town);
        setWeatherData(weather);
      } catch (error) {
        console.log(error);
      }
    };
    downloadWeather(town);
  }, [town]);

  const convertCelsiusToFahrenheit = (celsius) => {
    return (celsius * 9) / 5 + 32;
  };

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
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("WeatherDetails", {
          town,
          weatherData,
          updateWeatherData,
        })
      }
    >
      <View
        style={[
          styles.townContainer,
          weatherData ? getWeatherStyles(weatherData.condition) : {},
        ]}
      >
        <Text style={styles.townName}>{town.name}</Text>
        <Text style={styles.townDetails}>{town.vicinity}</Text>
        <Text style={styles.postalCode}>{town.postal}</Text>
        {weatherData ? (
          <View>
            <Text style={styles.townDetails}>
              Temperature:{" "}
              {convertCelsiusToFahrenheit(weatherData.temp).toFixed(1)}°F
            </Text>
            <Text style={styles.townDetails}>
              Weather: {weatherData.condition}
            </Text>
            <Image
              style={styles.weatherIcon}
              source={{
                uri: `http://openweathermap.org/img/wn/${weatherData.icon}.png`,
              }}
            />
          </View>
        ) : (
          <Text style={styles.townDetails}>Loading weather data...</Text>
        )}
      </View>
    </TouchableOpacity>
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

export default WeatherTownItem;
