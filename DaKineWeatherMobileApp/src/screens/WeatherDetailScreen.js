import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { handleVote, fetchWeather } from "../api";

const WeatherDetailScreen = ({ route }) => {
  const { town, updateWeatherData } = route.params;
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [possibleConditions, setPossibleConditions] = useState([
    { condition: "Clear", icon: "01d", color: "#FDB813" },
    { condition: "Clouds", icon: "02d", color: "#A9A9A9" },
    { condition: "Rain", icon: "09d", color: "#4BACC6" },
    { condition: "Drizzle", icon: "10d", color: "#4BACC6" },
    { condition: "Thunderstorm", icon: "11d", color: "#FFD700" },
    { condition: "Snow", icon: "13d", color: "#FFFFFF" },
    { condition: "Mist", icon: "50d", color: "#D3D3D3" },
    { condition: "Smoke", icon: "50d", color: "#A9A9A9" },
    { condition: "Haze", icon: "50d", color: "#D3D3D3" },
    { condition: "Dust", icon: "50d", color: "#FFEBCD" },
    { condition: "Fog", icon: "50d", color: "#D3D3D3" },
    { condition: "Sand", icon: "50d", color: "#FFEBCD" },
    { condition: "Ash", icon: "50d", color: "#A9A9A9" },
    { condition: "Squall", icon: "50d", color: "#4BACC6" },
    { condition: "Tornado", icon: "50d", color: "#9400D3" },
  ]);

  useEffect(() => {
    const downloadWeather = async (town) => {
      try {
        const weather = await fetchWeather(town);
        setWeather(weather);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    downloadWeather(town);
  }, [town]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20315f" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{town.name}</Text>
      {weather ? (
        <>
          <View style={styles.weatherDetailsContainer}>
            <Text style={styles.weatherDetails}>
              <Text style={styles.weatherLabel}>Condition:</Text>{" "}
              {weather.condition}
            </Text>
            <Text style={styles.weatherDetails}>
              <Text style={styles.weatherLabel}>Temperature:</Text>{" "}
              {weather.temp}°C
            </Text>
            <Text style={styles.weatherDetails}>
              <Text style={styles.weatherLabel}>Humidity:</Text>{" "}
              {weather.humidity}%
            </Text>
            <Text style={styles.weatherDetails}>
              <Text style={styles.weatherLabel}>Wind Speed:</Text>{" "}
              {weather.windSpeed} m/s
            </Text>
          </View>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.voteButton}
            onPress={async () => {
              console.log("vote for ", town);
              await handleVote(
                town,
                weather.condition,
                fetchWeather,
                updateWeatherData
              );
              await fetchWeather(town); // Refresh the current weather data
              updateWeatherData(); // Notify HomeScreen to update
            }}
          >
            <Text style={styles.voteButtonText}>
              Vote for Current Condition
            </Text>
          </TouchableOpacity>

          <Text style={styles.subTitle}>Vote for Selected Status:</Text>
          <View style={styles.conditionsContainer}>
            {possibleConditions.map(({ condition, icon, color }) => (
              <TouchableOpacity
                style={[styles.conditionButton, { backgroundColor: color }]}
                key={condition}
                onPress={async () => {
                  await handleVote(
                    town,
                    condition,
                    fetchWeather,
                    updateWeatherData
                  );
                  await fetchWeather(town); // Refresh the current weather data
                  updateWeatherData(); // Notify HomeScreen to update
                }}
              >
                <Image
                  style={styles.weatherIcon}
                  source={{
                    uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                    cache: "force-cache",
                  }}
                />
                <Text style={styles.conditionText}>{condition}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.noDataText}>No weather data available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f4f8",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#20315f",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#20315f",
    textAlign: "center",
  },
  weatherDetailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  weatherDetails: {
    fontSize: 20,
    color: "#20315f",
    marginBottom: 15,
  },
  weatherLabel: {
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 20,
  },
  voteButton: {
    backgroundColor: "#20315f",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  voteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#20315f",
    textAlign: "center",
  },
  conditionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  conditionButton: {
    margin: 10,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  weatherIcon: {
    width: 50,
    height: 50,
  },
  conditionText: {
    fontSize: 16,
    color: "#000",
    marginTop: 5,
    fontWeight: "bold",
  },
  noDataText: {
    fontSize: 18,
    color: "#20315f",
    textAlign: "center",
  },
});

export default WeatherDetailScreen;
