// src/screens/DemoScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Animated,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default DemoScreen = () => {
  const [votes, setVotes] = useState({
    Clear: 0,
    Clouds: 0,
    Rain: 0,
    Drizzle: 0,
    Thunderstorm: 0,
    Snow: 0,
  });
  const [currentCondition, setCurrentCondition] = useState("Rain");
  const [useServiceData, setUseServiceData] = useState(true);
  const [animatedValue] = useState(new Animated.Value(1));
  const [voteAnimValue] = useState(new Animated.Value(1));
  const [conditionAnimValue] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  const weatherStatuses = [
    { name: "Clear", icon: "01d", color: "#FDB813", textColor: "#333" },
    { name: "Clouds", icon: "02d", color: "#A9A9A9", textColor: "#fff" },
    { name: "Rain", icon: "09d", color: "#4BACC6", textColor: "#fff" },
    { name: "Drizzle", icon: "10d", color: "#4BACC6", textColor: "#fff" },
    { name: "Thunderstorm", icon: "11d", color: "#FFD700", textColor: "#333" },
    { name: "Snow", icon: "13d", color: "#FFFFFF", textColor: "#333" },
  ];

  const handleVote = (status) => {
    const newVotes = { ...votes, [status]: votes[status] + 1 };
    setVotes(newVotes);

    // Check if user votes are enough to override service data
    const totalVotes = Object.values(newVotes).reduce((sum, v) => sum + v, 0);
    const threshold = 3; // Lower threshold for demonstration purposes

    if (totalVotes >= threshold) {
      const newCondition = Object.keys(newVotes).reduce((a, b) =>
        newVotes[a] > newVotes[b] ? a : b
      );
      setCurrentCondition(newCondition);
      setUseServiceData(false);
    } else {
      setUseServiceData(true);
    }

    // Pulse effect
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate vote count
    voteAnimValue.setValue(0);
    Animated.timing(voteAnimValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animate condition change
    conditionAnimValue.setValue(0);
    Animated.timing(conditionAnimValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const currentConditionData = weatherStatuses.find(
    (status) => status.name === currentCondition
  );

  useEffect(() => {
    Animated.timing(conditionAnimValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentCondition]);

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1489914099268-1dad649f76bf?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      }}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.overlay}>
        <Text style={styles.title}>Ōkīna Weather Demo</Text>
        <Text style={styles.subtitle}>
          How Community Voting Updates Weather
        </Text>

        <View
          style={[
            styles.section,
            { backgroundColor: currentConditionData?.color || "#fff" },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: currentConditionData?.textColor || "#000" },
            ]}
          >
            Current Weather Condition
          </Text>
          <Text
            style={[
              styles.description,
              { color: currentConditionData?.textColor || "#000" },
            ]}
          >
            The weather condition is set based on:
          </Text>
          <Animated.View
            style={[
              styles.conditionIconContainer,
              {
                opacity: conditionAnimValue,
                transform: [
                  {
                    scale: conditionAnimValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image
              style={styles.currentWeatherIcon}
              source={{
                uri: `https://openweathermap.org/img/wn/${currentConditionData?.icon}@2x.png`,
              }}
            />
            <Text
              style={[
                styles.currentConditionText,
                { color: currentConditionData?.textColor || "#000" },
              ]}
            >
              {currentCondition}{" "}
              {!useServiceData && (
                <Text
                  style={[
                    styles.userVoteLabel,
                    { color: currentConditionData?.textColor || "#000" },
                  ]}
                >
                  (Community Votes)
                </Text>
              )}
            </Text>
          </Animated.View>
          {useServiceData && (
            <Text style={styles.serviceLabel}>
              Initially set by our reliable weather service. Keep voting to
              reflect real-time community input!
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vote for Weather Condition</Text>
          <Text style={styles.description}>
            Your vote helps to reflect the actual weather condition:
          </Text>
          <View style={styles.conditionsContainer}>
            {weatherStatuses.map(({ name, icon, color, textColor }) => (
              <TouchableOpacity
                key={name}
                style={[styles.conditionButton, { backgroundColor: color }]}
                onPress={() => handleVote(name)}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        scale: animatedValue,
                      },
                    ],
                  }}
                >
                  <Image
                    style={styles.weatherIcon}
                    source={{
                      uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                    }}
                  />
                </Animated.View>
                <Text style={[styles.conditionText, { color: textColor }]}>
                  {name}
                </Text>
                <Animated.Text
                  style={{
                    ...styles.voteCount,
                    color: textColor,
                    opacity: voteAnimValue,
                    transform: [
                      {
                        scale: voteAnimValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  }}
                >
                  {votes[name]} votes
                </Animated.Text>
                {currentCondition === name && (
                  <Animated.View
                    style={[
                      styles.checkmarkContainer,
                      {
                        opacity: animatedValue,
                        transform: [
                          {
                            scale: animatedValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.8, 1.4],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.checkmark}>✔️</Text>
                  </Animated.View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("SignIn")}
        >
          <Text style={styles.homeButtonText}>Back to Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    width: "90%",
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  conditionIconContainer: {
    alignItems: "center",
  },
  currentWeatherIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  currentConditionText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  userVoteLabel: {
    fontSize: 14,
    color: "#4CAF50",
  },
  serviceLabel: {
    fontSize: 14,
    color: "#FFD700",
    marginTop: 10,
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
    position: "relative",
  },
  weatherIcon: {
    width: 50,
    height: 50,
  },
  conditionText: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: "bold",
  },
  voteCount: {
    fontSize: 14,
    marginTop: 5,
  },
  checkmarkContainer: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    fontSize: 24,
    color: "#4285F4",
  },
  homeButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
