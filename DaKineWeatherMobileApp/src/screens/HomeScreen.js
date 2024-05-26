import React, { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  View,
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
            console.log("Guest ID:", id);
          }
        });
      }
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    onRefresh?.().finally(() => setRefreshing(false));
  }, [onRefresh]);

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
        <View style={styles.header}>
          <Text style={styles.title}>Weather Overview</Text>
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {errorMsg ? (
          <Text style={styles.error}>Error: {errorMsg}</Text>
        ) : (
          <>
            <View style={styles.locationInfo}>
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
            </View>

            {towns && towns.length > 0 ? (
              <>
                <Text style={styles.subTitle}>Nearby Towns:</Text>
                <View style={styles.townList}>
                  {towns.map((town, index) => (
                    <WeatherTownItem
                      key={index}
                      town={town}
                      navigation={navigation}
                    />
                  ))}
                </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#1a73e8",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#20315f",
  },
  locationInfo: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#305f72",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: "#4a6572",
    marginBottom: 5,
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
  townList: {
    marginBottom: 20,
  },
});
