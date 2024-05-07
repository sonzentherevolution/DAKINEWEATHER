import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function HomeScreen({ city, location, errorMsg, towns }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>HomeScreen</Text>
      {errorMsg ? (
        <Text style={styles.error}>Error: {errorMsg}</Text>
      ) : (
        <>
          {city && <Text style={styles.info}>City: {city}</Text>}
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
                <View key={index} style={styles.townContainer}>
                  <Text style={styles.townName}>{town.name}</Text>
                  <Text style={styles.townDetails}>{town.vicinity}</Text>
                </View>
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
    backgroundColor: "#f5f5f5", // Light grey background for the entire view
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333", // Dark text for better readability
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#444", // Medium grey for subtitles
    marginTop: 20,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: "#666", // Light grey for informational text
    marginBottom: 5,
  },
  townContainer: {
    backgroundColor: "#fff", // White background for town items
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, // Android shadow
  },
  townName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333", // Dark text for town name
  },
  townDetails: {
    fontSize: 14,
    color: "#666", // Light grey for details
  },
  error: {
    fontSize: 16,
    color: "red", // Red for errors
    marginBottom: 10,
  },
  waiting: {
    fontSize: 16,
    color: "blue", // Blue for the waiting message
    marginTop: 10,
  },
});
