import React, { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WeatherTownItem from "../components/WeatherTownItem";

export default function HomeScreen({
  navigation,
  city,
  location,
  errorMsg,
  towns,
  onRefresh,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [guestId, setGuestId] = useState(null);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("userToken").then((token) => {
      setUserToken(token);
      if (!token) {
        AsyncStorage.getItem("guestId").then((id) => {
          setGuestId(id);
          if (id) {
            console.log("Guest ID:", id); // Log the guest ID to the console
          }
        });
      }
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    onRefresh?.().finally(() => setRefreshing(false));
  }, [onRefresh]);

  // Function to handle user sign out
  const handleSignOut = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("guestId");
    setUserToken(null);
    setGuestId(null);
    navigation.navigate("SignIn");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Pressable style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
        <Text style={styles.title}>Weather Overview</Text>
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
                  <WeatherTownItem
                    key={index}
                    town={town}
                    navigation={navigation}
                  />
                ))}
              </>
            ) : (
              <Text style={styles.waiting}>Waiting for location...</Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#1a73e8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
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
