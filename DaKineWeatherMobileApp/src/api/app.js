import axios from "axios";
import { BASE_URL, GOOGLE_API } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create an Axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Function to fetch geocode information
export const fetchGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API}`
    );
    if (response.data.status === "OK") {
      const addressComponents = response.data.results[0].address_components;
      const cityComp = addressComponents.find((comp) =>
        comp.types.includes("locality")
      );
      const postalComp = addressComponents.find((comp) =>
        comp.types.includes("postal_code")
      );
      return {
        city: cityComp ? cityComp.long_name : "Unknown city",
        postalCode: postalComp ? postalComp.long_name : "Unknown postal code",
      };
    } else {
      throw new Error("Reverse geocoding failed: " + response.data.status);
    }
  } catch (error) {
    console.error("Error fetching geocode:", error);
    throw error; // Rethrowing the error to be handled by the caller
  }
};

// Function to fetch nearby places
export const fetchNearbyPlaces = async (latitude, longitude) => {
  try {
    const response = await api.get(`/nearby-places`, {
      params: { latitude, longitude },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    throw error; // Rethrowing the error to be handled by the caller
  }
};

// Function to handle voting
export const handleVote = async (
  location,
  condition,
  fetchWeather,
  updateWeatherData
) => {
  const userId = await AsyncStorage.getItem("userId");
  try {
    const response = await fetch("http://localhost:5001/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, location, condition }),
    });
    const data = await response.json();
    if (data.success) {
      console.log(data.message);
      // Trigger mock votes
      await fetch("http://localhost:5001/mock/add-mock-votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, condition }),
      });
      // Fetch updated weather data after voting
      await fetchWeather();
      // Notify the home screen to update
      updateWeatherData();
    } else {
      console.error("Failed to record vote", data);
    }
  } catch (error) {
    console.error("Failed to record vote", error);
  }
};

export default api;
