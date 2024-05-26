require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Vote = require("../models/Vote");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const mockUsers = [
  { email: "user1@example.com", name: "User One", userId: "user1" },
  { email: "user2@example.com", name: "User Two", userId: "user2" },
  { email: "user3@example.com", name: "User Three", userId: "user3" },
  { email: "user4@example.com", name: "User Four", userId: "user4" },
  { email: "user5@example.com", name: "User Five", userId: "user5" },
];

const towns = [
  "Kalihiwai",
  "Anahola",
  "Hanamaulu",
  "Wailua",
  "Koloa",
  "Wainiha",
  "Hanalei",
  "Puhi",
  "Kaumakani",
  "Lawai",
  "Lihue",
  "Kalaheo",
  "Kekaha",
  "Pakala Village",
  "Kealia",
  "Kilauea",
  "Wailua Homesteads",
  "Waimea",
  "Princeville",
  "Eleele",
];

const createMockUsers = async () => {
  try {
    await User.deleteMany({});
    await Vote.deleteMany({});

    const users = mockUsers.map((user) => new User(user));
    await User.insertMany(users);
    console.log("Mock users created");

    const votes = [];
    const conditions = ["Clear", "Clouds", "Rain", "Drizzle", "Thunderstorm"];

    users.forEach((user, index) => {
      towns.forEach((town) => {
        votes.push(
          new Vote({
            userId: user._id,
            location: town,
            condition: conditions[index % conditions.length],
          })
        );
      });
    });

    await Vote.insertMany(votes);
    console.log("Mock votes created");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error creating mock data:", error);
    mongoose.connection.close();
  }
};

const addMockVotes = async (location, condition) => {
  try {
    const users = await User.find({});
    const votes = users.map((user) => ({
      userId: user._id,
      location,
      condition,
    }));

    await Vote.insertMany(votes);
    console.log(
      `Added mock votes for condition: ${condition} in location: ${location}`
    );

    mongoose.connection.close();
  } catch (error) {
    console.error("Error adding mock votes:", error);
    mongoose.connection.close();
  }
};

// Check for arguments to trigger specific functions
const [, , command, location, condition] = process.argv;

if (command === "create") {
  createMockUsers();
} else if (command === "vote" && location && condition) {
  addMockVotes(location, condition);
} else {
  console.log("Invalid command or missing arguments.");
  mongoose.connection.close();
}
