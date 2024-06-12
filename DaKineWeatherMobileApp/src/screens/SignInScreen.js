import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ImageBackground,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { useAuth } from "../context/AuthContext";
import { OAUTH_WEB_CLIENT_ID, OAUTH_IOS_CLIENT_ID } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook

const SignInScreen = ({ navigation }) => {
  const { handleGoogleSignIn, signIn } = useAuth();
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: OAUTH_IOS_CLIENT_ID,
    webClientId: OAUTH_WEB_CLIENT_ID,
  });

  useEffect(() => {
    const fetchUserInfo = async (accessToken) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
        );
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
      }
    };

    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) {
        fetchUserInfo(accessToken).then((userInfo) => {
          handleGoogleSignIn(userInfo).then((returning) => {
            navigation.navigate("Home", { returning });
          });
        });
      } else {
        Alert.alert("Error", "Failed to retrieve access token");
      }
    } else if (response?.type === "error") {
      Alert.alert("Error", "Google Sign-In failed");
    }
  }, [response]);

  const signInAsGuest = async () => {
    try {
      const response = await fetch("http://localhost:5001/guest-login", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      await signIn(data.userToken, data.userId);
      navigation.navigate("Home", { returning: data.returning });
    } catch (error) {
      console.error("Error signing in as guest:", error);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1489914099268-1dad649f76bf?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>
          Welcome to{" "}
          <Text style={styles.logoInline}>
            Ōkīna <Text style={styles.raindropInline}>ʻ</Text> Weather
          </Text>
        </Text>
        <Text style={styles.subtitle}>Your ultimate weather companion</Text>
        <Text style={styles.features}>
          <Text style={styles.icon}>☀️ </Text>Real-time weather updates{"\n"}
          <Text style={styles.icon}>⛅ </Text>Personalized forecasts{"\n"}
          <Text style={styles.icon}>⚠️ </Text>Weather alerts
        </Text>

        <Pressable style={styles.buttonGoogle} onPress={() => promptAsync()}>
          <Text style={styles.buttonText}>Sign In With Google</Text>
        </Pressable>
        <Pressable style={styles.buttonGuest} onPress={signInAsGuest}>
          <Text style={styles.buttonText}>Sign In As Guest</Text>
        </Pressable>

        <Pressable
          style={styles.buttonDemo}
          onPress={() => navigation.navigate("Demo")}
        >
          <Text style={styles.buttonText}>See a Demo</Text>
        </Pressable>

        <Pressable
          style={styles.buttonLearnMore}
          onPress={() => navigation.navigate("LearnMore")} // Navigate to Learn More
        >
          <Text style={styles.buttonText}>Learn More</Text>
        </Pressable>
      </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flex: 1,
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
  logoInline: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  raindropInline: {
    color: "#4FC3F7",
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  features: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  icon: {
    fontSize: 20,
  },
  buttonGoogle: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#4285F4",
    borderRadius: 25,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 6,
    justifyContent: "center",
    background: "linear-gradient(90deg, #4285F4 0%, #34A853 100%)",
  },
  buttonGuest: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#8E8E93",
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 6,
    justifyContent: "center",
  },
  buttonDemo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FF5733",
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 6,
    justifyContent: "center",
    marginTop: 15,
  },
  buttonLearnMore: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFA500", // Different color to stand out
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 6,
    justifyContent: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  learnMore: {
    fontSize: 14,
    color: "#A0A0A0",
    textAlign: "center",
    marginTop: 20,
    textDecorationLine: "underline",
  },
});

export default SignInScreen;
