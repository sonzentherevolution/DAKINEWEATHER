import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { useAuth } from "../context/AuthContext"; // Import useAuth from your context
import { OAUTH_WEB_CLIENT_ID, OAUTH_IOS_CLIENT_ID } from "@env";

const SignInScreen = ({ navigation }) => {
  const { signIn } = useAuth(); // Use the signIn function from the context
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: OAUTH_IOS_CLIENT_ID,
    webClientId: OAUTH_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      signIn(authentication.accessToken); // Use signIn from context to update the userToken state
      navigation.navigate("Home"); // Navigate to Home after successful sign-in
    }
  }, [response, signIn, navigation]);

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={() => promptAsync()}>
        <Text style={styles.buttonText}>Sign In With Google</Text>
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
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default SignInScreen;
