const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true }, // Added title field
  coverLetter: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Favorite = mongoose.model("Favorite", FavoriteSchema);

module.exports = Favorite;
