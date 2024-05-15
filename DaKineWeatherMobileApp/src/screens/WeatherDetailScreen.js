import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const WeatherDetailScreen = ({ route }) => {
  const { town, weatherData } = route.params; // Extract weatherData from the navigation parameters

  const convertCelsiusToFahrenheit = (celsius) => {
    return (celsius * 9) / 5 + 32;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{town.name}</Text>
      {weatherData ? (
        <>
          <Text style={styles.weatherDetails}>
            Temperature:{" "}
            {convertCelsiusToFahrenheit(weatherData.main.temp).toFixed(1)}°F
          </Text>
          <Text style={styles.weatherDetails}>
            Weather: {weatherData.weather[0].description}
          </Text>
          <Text style={styles.weatherDetails}>
            Humidity: {weatherData.main.humidity}%
          </Text>
          <Text style={styles.weatherDetails}>
            Wind Speed: {weatherData.wind.speed} m/s
          </Text>
          <Image
            style={styles.weatherIcon}
            source={{
              uri: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`,
            }}
          />
        </>
      ) : (
        <Text>No weather data available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8", // Light grey background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#20315f", // Dark blue for text
  },
  weatherDetails: {
    fontSize: 18,
    color: "#20315f", // Dark text for readability
    marginBottom: 10,
    textAlign: "center", // Center align text for better aesthetics
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginBottom: 20, // Add some space below the icon
  },
});

export default WeatherDetailScreen;
