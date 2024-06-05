import React, { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WeatherTownItem from "../components/WeatherTownItem";

export default function HomeScreen({
  navigation,
  city,
  location,
  errorMsg,
  towns,
  onRefresh,
  route,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [guestId, setGuestId] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [userScore, setUserScore] = useState(0);
  const [welcomeOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchUserScore = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("User ID is missing");
        return;
      }
      try {
        const response = await fetch(`http://localhost:5001/user/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserScore(data.userScore);
      } catch (error) {
        console.error("Error fetching user score:", error);
      }
    };

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
      fetchUserScore();
    });

    if (route.params?.returning) {
      Animated.timing(welcomeOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(welcomeOpacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }).start();
        }, 2000);
      });
    }
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

  const updateWeatherData = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [handleRefresh])
  );

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

        <Animated.View
          style={[styles.welcomeBackContainer, { opacity: welcomeOpacity }]}
        >
          <Text style={styles.welcomeBackText}>Welcome Back!</Text>
        </Animated.View>

        <View style={styles.userScoreContainer}>
          <Text style={styles.userScoreText}>User Score: {userScore}</Text>
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
                      updateWeatherData={updateWeatherData}
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
  welcomeBackContainer: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: "#d4edda",
    borderRadius: 10,
    alignItems: "center",
  },
  welcomeBackText: {
    fontSize: 18,
    color: "#155724",
    fontWeight: "bold",
  },
  userScoreContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  userScoreText: {
    fontSize: 18,
    color: "#20315f",
    fontWeight: "bold",
  },
});
