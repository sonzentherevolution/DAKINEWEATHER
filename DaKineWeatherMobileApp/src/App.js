import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import SignInScreen from "./screens/SignInScreen";
import WeatherDetailScreen from "./screens/WeatherDetailScreen";
import * as Location from "expo-location";
import { registerRootComponent } from "expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api/app";
import { AuthProvider } from "./context/AuthContext";
import { GOOGLE_API, OAUTH_WEB_CLIENT_ID, OAUTH_IOS_CLIENT_ID } from "@env";
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
        console.log("Existing token found:", token);
        setUserToken(token);
      }
    });
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log(
        "New authentication token received:",
        authentication.accessToken
      );
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
        try {
          const city = await reverseGeocode(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude
          );
          setCity(city);
        } catch (error) {
          setErrorMsg(error.message);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (location) {
      const fetchNearbyPlaces = async () => {
        try {
          const response = await api.get(
            `/nearby-places?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`
          );
          setTowns(
            response.data.results.map((place) => ({
              name: place.name,
              vicinity: place.vicinity,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              postalCode: place.postalCode,
            }))
          );
        } catch (error) {
          console.error("API Test Failed:", error);
          setErrorMsg("Failed to fetch nearby places");
        }
      };
      fetchNearbyPlaces();
    }
  }, [location]);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API}`
      );
      const data = await response.json();
      if (data.status === "OK") {
        const addressComponents = data.results[0].address_components;
        const localityComponent = addressComponents.find((component) =>
          component.types.includes("locality")
        );
        const postalCodeComponent = addressComponents.find((component) =>
          component.types.includes("postal_code")
        );
        return {
          city: localityComponent
            ? localityComponent.long_name
            : "Unknown city",
          postalCode: postalCodeComponent
            ? postalCodeComponent.long_name
            : "Unknown ZIP code",
        };
      } else {
        throw new Error("Reverse geocoding failed");
      }
    } catch (error) {
      throw new Error("Reverse geocoding failed");
    }
  };

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home">
            {(props) => (
              <HomeScreen
                {...props}
                location={location}
                city={city}
                errorMsg={errorMsg}
                towns={towns} // Passing towns as a prop to HomeScreen
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
