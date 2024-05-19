const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  googleId: { type: String, unique: true, sparse: true }, // for Google authenticated users
  guestId: { type: String, unique: true, sparse: true }, // for guest users
  ipAddress: String,
  userScore: { type: Number, default: 0 },
  votes: [
    {
      condition: String,
      townName: String,
      timestamp: Date,
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
