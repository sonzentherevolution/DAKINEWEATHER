import axios from "axios";
import { BASE_URL, GOOGLE_API } from "@env";

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

export default api;
