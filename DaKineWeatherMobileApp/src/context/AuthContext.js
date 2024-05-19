import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("userToken").then(setUserToken);
  }, []);

  const signIn = async (token) => {
    await AsyncStorage.setItem("userToken", token);
    setUserToken(token);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("userToken");
    setUserToken(null);
  };

  const handleGoogleSignIn = async (userInfo) => {
    try {
      console.log("Sending user info to backend:", userInfo);
      const response = await fetch("http://localhost:5001/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });

      const data = await response.json();
      if (response.ok) {
        await signIn(data.userToken);
      } else {
        console.error("Google sign-in error:", data.message);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ userToken, signIn, signOut, handleGoogleSignIn }}
    >
      {children}
    </AuthContext.Provider>
  );
};
