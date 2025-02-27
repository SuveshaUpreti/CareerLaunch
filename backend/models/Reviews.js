const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  email: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
