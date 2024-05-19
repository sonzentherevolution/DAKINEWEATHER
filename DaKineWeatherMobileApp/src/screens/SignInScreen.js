import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { useAuth } from "../context/AuthContext";
import { OAUTH_WEB_CLIENT_ID, OAUTH_IOS_CLIENT_ID } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignInScreen = ({ navigation }) => {
  const { handleGoogleSignIn } = useAuth();
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: OAUTH_IOS_CLIENT_ID,
    webClientId: OAUTH_WEB_CLIENT_ID,
  });

  useEffect(() => {
    const fetchUserInfo = async (accessToken) => {
      try {
        console.log("Fetching user info using access token:", accessToken);
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
        );
        const data = await response.json();
        console.log("User info response data:", data); // Log the response from userinfo endpoint
        return data;
      } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
      }
    };

    if (response?.type === "success") {
      console.log("Google response:", response); // Log the entire response object
      const accessToken = response.authentication?.accessToken;
      console.log("Access Token:", accessToken); // Log the access token to verify
      if (accessToken) {
        fetchUserInfo(accessToken).then((userInfo) => {
          console.log("Fetched User Info:", userInfo); // Log the user info to verify
          handleGoogleSignIn(userInfo);
          navigation.navigate("Home");
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
      await AsyncStorage.setItem("guestId", data.guestId);
      console.log("Guest ID:", data.guestId); // Log the guest ID
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error signing in as guest:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => promptAsync()}>
        <Text style={styles.buttonText}>Sign In With Google</Text>
      </Pressable>
      <Pressable style={styles.guestButton} onPress={signInAsGuest}>
        <Text style={styles.buttonText}>Sign In As Guest</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1a73e8",
    borderRadius: 5,
    marginBottom: 10,
  },
  guestButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#777",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default SignInScreen;
