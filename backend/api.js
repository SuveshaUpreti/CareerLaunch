const express = require("express");
const { authenticateUser } = require("./authMiddleware"); // ✅ Import auth middleware
const Favorite = require("./models/Favorite"); // ✅ Import Favorite model

const router = express.Router();
// ✅ Save a favorite cover letter with title and duplicate check
router.post("/favorites", authenticateUser, async (req, res) => {
    try {
      const { coverLetter, title } = req.body;
  
      // Log the incoming data for debugging
      console.log("Attempting to save favorite with:", { coverLetter, title });
  
      // Validate that both title and cover letter are provided
      if (!coverLetter || !title || typeof title !== 'string' || typeof coverLetter !== 'string') {
        console.log("❌ Missing or invalid title or cover letter");
        return res
          .status(400)
          .json({ message: "Please entera valid title  before saving." });
      }
  
      // Check for duplicate (same userId, title, and cover letter)
      const existingFavorite = await Favorite.findOne({
        userId: req.userId,
        title: title.trim(),
        coverLetter: coverLetter.trim(),
      });
  
      if (existingFavorite) {
        console.log("❌ Duplicate found for user:", req.userId);
        return res.status(409).json({
          message: "Favorite with the same title and cover letter already exists.",
        });
      }
  
      // Save the new favorite
      const newFavorite = new Favorite({
        userId: req.userId,
        title: title.trim(),
        coverLetter: coverLetter.trim(),
      });
  
      await newFavorite.save();
  
      // Success response
      console.log("✅ Favorite saved successfully!");
      res.status(201).json({ message: "✅ Cover letter saved to favorites!" });
    } catch (error) {
      console.error("❌ Error saving favorite:", error);
      res.status(500).json({ message: "Failed to save favorite", error });
    }
  });
  

// ✅ Fetch all favorite cover letters for the logged-in user
router.get("/favorites", authenticateUser, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId });

    if (!favorites.length) {
      return res
        .status(404)
        .json({ message: "No favorite cover letters found" });
    }

    res.json(favorites);
  } catch (error) {
    console.error("❌ Error fetching favorites:", error);
    res.status(500).json({ message: "Failed to retrieve favorites", error });
  }
});

// ✅ Delete a favorite cover letter by ID
router.delete("/favorites/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFavorite = await Favorite.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deletedFavorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ message: "✅ Favorite removed successfully!" });
  } catch (error) {
    console.error("❌ Error deleting favorite:", error);
    res.status(500).json({ message: "Failed to delete favorite", error });
  }
});

module.exports = router;
