// src/context/AuthContext.js
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

  return (
    <AuthContext.Provider value={{ userToken, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
