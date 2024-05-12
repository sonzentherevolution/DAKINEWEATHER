import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useState, useEffect } from "react";
import HomeScreen from "./screens/HomeScreen";
import * as Location from "expo-location";
import { registerRootComponent } from "expo";
import { Text, View } from "react-native";
import api from "./api/app";
import { GOOGLE_API } from "@env";

const Stack = createStackNavigator();

function App() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [towns, setTowns] = useState([]); // State to store the list of towns

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (location) {
        try {
          const response = await api.get(
            `/nearby-places?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`
          );
          console.log("API Test Successful, response:", response);
          const townsData = response.data.results.map((place) => ({
            name: place.name,
            vicinity: place.vicinity,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            postalCode: place.postalCode, // Update this if the backend response structure changes
          }));
          setTowns(townsData);
        } catch (err) {
          console.error("API Test Failed:", err);
          setErrorMsg("Failed to fetch nearby places");
        }
      }
    };

    fetchNearbyPlaces();
  }, [location]); // useEffect will trigger when location changes

  const GOOGLE_MAPS_API_KEY = GOOGLE_API;

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      console.log("REVERSE", data);

      if (data.status === "OK") {
        const addressComponents = data.results[0].address_components;

        // Find the relevant components like locality (city) and postal code
        const localityComponent = addressComponents.find((component) =>
          component.types.includes("locality")
        );
        const postalCodeComponent = addressComponents.find((component) =>
          component.types.includes("postal_code")
        );

        // Extract city and postal code from the components
        const city = localityComponent
          ? localityComponent.long_name
          : "Unknown city";
        const postalCode = postalCodeComponent
          ? postalCodeComponent.long_name
          : "Unknown ZIP code";

        return { city, postalCode };
      } else {
        throw new Error("Reverse geocoding failed");
      }
    } catch (error) {
      throw new Error("Reverse geocoding failed");
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      if (location) {
        try {
          const city = await reverseGeocode(
            location.coords.latitude,
            location.coords.longitude
          );
          setCity(city);
        } catch (error) {
          setErrorMsg(error.message);
        }
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home">
          {(props) => (
            <HomeScreen
              {...props}
              location={location}
              city={city}
              errorMsg={errorMsg}
              towns={towns} // Passing the towns data as a prop to HomeScreen
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);
export default App;
