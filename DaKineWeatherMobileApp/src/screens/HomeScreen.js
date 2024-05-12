import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import TownWeatherItem from "../components/WeatherTownItem";

export default function HomeScreen({ city, location, errorMsg, towns }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>HomeScreen</Text>
      {errorMsg ? (
        <Text style={styles.error}>Error: {errorMsg}</Text>
      ) : (
        <>
          {city && <Text style={styles.info}>City: {city.city}</Text>}
          {city && (
            <Text style={styles.info}>Postal Code: {city.postalCode}</Text>
          )}
          {location && (
            <Text style={styles.info}>
              Coordinates: {location.coords.latitude},{" "}
              {location.coords.longitude}
            </Text>
          )}
          {towns && towns.length > 0 ? (
            <>
              <Text style={styles.subTitle}>Nearby Towns:</Text>
              {towns.map((town, index) => (
                <TownWeatherItem key={index} town={town} />
              ))}
            </>
          ) : (
            !city &&
            !location && (
              <Text style={styles.waiting}>Waiting for location...</Text>
            )
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#20315f",
    marginBottom: 20,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "500",
    color: "#305f72",
    marginTop: 30,
    marginBottom: 10,
    textAlign: "center",
  },
  info: {
    fontSize: 16,
    color: "#4a6572",
    marginBottom: 5,
    textAlign: "center",
  },
  error: {
    fontSize: 18,
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  waiting: {
    fontSize: 18,
    color: "#305f72",
    marginTop: 10,
    textAlign: "center",
  },
});
