import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Alert, Image } from "react-native";
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
        console.log("User info response data:", data);
        return data;
      } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
      }
    };

    if (response?.type === "success") {
      console.log("Google response:", response);
      const accessToken = response.authentication?.accessToken;
      console.log("Access Token:", accessToken);
      if (accessToken) {
        fetchUserInfo(accessToken).then((userInfo) => {
          console.log("Fetched User Info:", userInfo);
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
      await AsyncStorage.setItem("userId", data.guestId);
      console.log("Guest ID:", data.guestId);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error signing in as guest:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://files.oaiusercontent.com/file-jKehW7qlJgYLajG51dpnQ4Yu?se=2024-05-20T01%3A23%3A09Z&sp=r&sv=2023-11-03&sr=b&rscc=max-age%3D31536000%2C%20immutable&rscd=attachment%3B%20filename%3De5adf30c-dcdd-4a16-8c25-bd9efe4321ee.webp&sig=ZepjUyvS60xKl3YQeDlOImGeCmQAOa3UYQ/PJlM%2B7RI%3D",
        }}
        style={styles.logo}
      />
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
    backgroundColor: "#f0f4f8",
  },
  logo: {
    width: 200,
    height: 200,
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
