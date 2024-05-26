require("dotenv").config(); // Ensure .env is loaded before anything else

const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");

const authRoutes = require("./routes/auth");
const weatherRoutes = require("./routes/weather");
const voteRoutes = require("./routes/vote");
const nearbyPlacesRoutes = require("./routes/nearby-places");
const mockRoutes = require("./routes/mock");

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

// Clear and refresh data each day
setInterval(async () => {
  await Weather.deleteMany({});
}, 24 * 60 * 60 * 1000); // Clear every 24 hours

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
