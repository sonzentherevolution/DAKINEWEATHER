import React from "react";
import { View, Text, StyleSheet, Image, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WeatherDetailScreen = ({ route }) => {
  const { town, weatherData } = route.params;

  const convertCelsiusToFahrenheit = (celsius) => {
    return (celsius * 9) / 5 + 32;
  };

  const handleVote = async (condition) => {
    const voteData = {
      condition,
      townName: town.name,
      timestamp: new Date(),
    };

    const guestId = await AsyncStorage.getItem("guestId");
    fetch("/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId, voteData }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Vote recorded");
        } else {
          console.error("Vote failed:", data.message);
        }
      });
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
          <Button
            title="Vote for this condition"
            onPress={() => handleVote(weatherData.weather[0].description)}
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
    backgroundColor: "#f0f4f8",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#20315f",
  },
  weatherDetails: {
    fontSize: 18,
    color: "#20315f",
    marginBottom: 10,
    textAlign: "center",
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});

export default WeatherDetailScreen;
