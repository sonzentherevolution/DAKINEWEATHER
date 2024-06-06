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
        <Text style={styles.title}>Welcome to Okina Weather</Text>
        <Text style={styles.subtitle}>Your ultimate weather companion</Text>
        <Pressable style={styles.button} onPress={() => promptAsync()}>
          <Text style={styles.buttonText}>Sign In With Google</Text>
        </Pressable>
        <Pressable style={styles.guestButton} onPress={signInAsGuest}>
          <Text style={styles.buttonText}>Sign In As Guest</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1a73e8",
    borderRadius: 5,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
  },
  guestButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#555",
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SignInScreen;
