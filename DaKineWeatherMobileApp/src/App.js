// src/App.js
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import SignInScreen from "./screens/SignInScreen";
import WeatherDetailScreen from "./screens/WeatherDetailScreen";
import DemoScreen from "./screens/DemoScreen"; // Import the DemoScreen component
import LearnMoreScreen from "./screens/LearnMoreScreen"; // Import the LearnMoreScreen component
import { OAUTH_WEB_CLIENT_ID, OAUTH_IOS_CLIENT_ID } from "@env";
import * as Location from "expo-location";
import { registerRootComponent } from "expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchGeocode, fetchNearbyPlaces } from "./api";
import { AuthProvider } from "./context/AuthContext";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

const Stack = createStackNavigator();

function App() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [towns, setTowns] = useState([]);
  const [userToken, setUserToken] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: OAUTH_IOS_CLIENT_ID,
    webClientId: OAUTH_WEB_CLIENT_ID,
  });

  useEffect(() => {
    AsyncStorage.getItem("userToken").then((token) => {
      if (token) {
        setUserToken(token);
      }
    });
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      AsyncStorage.setItem("userToken", authentication.accessToken).then(() => {
        setUserToken(authentication.accessToken);
      });
    }
  }, [response]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      if (currentLocation) {
        fetchGeocode(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        )
          .then((data) => {
            setCity(data.city);
          })
          .catch((error) => {
            setErrorMsg("Reverse geocoding failed: " + error.message);
          });
      }
    })();
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyPlaces(location.coords.latitude, location.coords.longitude)
        .then((data) => {
          setTowns(
            data.results.map((place) => ({
              name: place.name,
              vicinity: place.vicinity,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              postalCode: place.postalCode,
            }))
          );
        })
        .catch((error) => {
          console.error("API Test Failed:", error);
          setErrorMsg("Failed to fetch nearby places");
        });
    }
  }, [location]);

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignIn">
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Demo" component={DemoScreen} />
          <Stack.Screen name="LearnMore" component={LearnMoreScreen} />
          <Stack.Screen name="Home">
            {(props) => (
              <HomeScreen
                {...props}
                location={location}
                city={city}
                errorMsg={errorMsg}
                towns={towns}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="WeatherDetails" component={WeatherDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

registerRootComponent(App);
export default App;
