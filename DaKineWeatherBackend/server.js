require("dotenv").config(); // Ensure .env is loaded before anything else

const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");
const authRoutes = require("./routes/auth");
const weatherRoutes = require("./routes/weather");
const voteRoutes = require("./routes/vote");
const nearbyPlacesRoutes = require("./routes/nearby-places");
const mockRoutes = require("./routes/mock");
const userRoutes = require("./routes/user"); // Import the user routes
const Weather = require("./models/Weather"); // Ensure Weather model is imported
const User = require("./models/User"); // Ensure User model is imported

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Use routes
app.use(authRoutes);
app.use(weatherRoutes);
app.use(voteRoutes);
app.use(nearbyPlacesRoutes);
app.use(mockRoutes);
app.use(userRoutes); // Use the user routes

// Add user score endpoint (moved to userRoutes)

// Clear and refresh data each day
setInterval(async () => {
  await Weather.deleteMany({});
}, 24 * 60 * 60 * 1000); // Clear every 24 hours

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
