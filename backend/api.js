const express = require("express");
const nodemailer = require("nodemailer");
const { authenticateUser } = require("./authMiddleware"); // ✅ Import auth middleware
const Favorite = require("./models/Favorite"); // ✅ Import Favorite model
const Review = require("./models/Reviews");

const router = express.Router();
router.post("/favorites", authenticateUser, async (req, res) => {
  try {
      const { coverLetter, title } = req.body;
      const userId = req.user?.userId; // ✅ Ensure `userId` is retrieved

      if (!userId) {
          console.error("❌ User ID is missing in request!");
          return res.status(400).json({ message: "User ID is required." });
      }

      console.log("🔍 Attempting to save favorite with:", { userId, coverLetter, title });

      // ✅ Ensure both coverLetter and title are present
      if (!coverLetter || !title || typeof title !== "string" || typeof coverLetter !== "string") {
          return res.status(400).json({ message: "Please enter a title for the Cover Letter" });
      }

      // ✅ Check if the same title + cover letter combination already exists for the user
      const existingFavorite = await Favorite.findOne({ userId, title: title.trim(), coverLetter: coverLetter.trim() });
      
      if (existingFavorite) {
          console.log("❌ Duplicate favorite found for user:", userId);
          return res.status(409).json({ message: "This cover letter with the same title already exists in your favorites." });
      }

      // ✅ Save the new favorite
      const newFavorite = new Favorite({
          userId,  // ✅ Ensure userId is stored correctly
          coverLetter: coverLetter.trim(),
          title: title.trim(),
      });

      await newFavorite.save();
      console.log("✅ Favorite saved successfully!");
      res.status(201).json({ message: "Favorite saved successfully!" });
  } catch (error) {
      console.error("❌ Error saving favorite:", error);
      res.status(500).json({ message: "Failed to save favorite", error: error.message });
  }
});


router.get("/favorites", authenticateUser, async (req, res) => {
  try {
      const userId = req.user?.userId; // ✅ Fix: Get `userId` from `req.user`
      
      if (!userId) {
          return res.status(400).json({ message: "User ID is required but not found." });
      }

      const favorites = await Favorite.find({ userId });

      if (!favorites.length) {
          return res.status(404).json({ message: "No favorite cover letters found." });
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


// ✅ Submit a Review (Automatically Retrieve Email from Authenticated User)
router.post("/reviews", authenticateUser, async (req, res) => {
    try {
        const { rating, text } = req.body;
        const email = req.user?.email; // ✅ Get email from authenticated session

        console.log("Incoming Review Data:", { email, rating, text });

        if (!rating || !text) {
            console.log("❌ Missing rating or text in request");
            return res.status(400).json({ message: "Please provide a rating and review text." });
        }

        if (!email) {
            console.log("❌ User email not found in request");
            return res.status(400).json({ message: "User email is required but was not found in session." });
        }

        const newReview = new Review({ email, rating, text });
        await newReview.save();

        console.log("✅ Review saved successfully!");
        res.status(201).json({ message: "✅ Review submitted successfully!" });
    } catch (error) {
        console.error("❌ Error saving review:", error);
        res.status(500).json({ message: "Failed to submit review.", error: error.message });
    }
});

// ✅ Fetch All Reviews (No Authentication Required)
router.get("/reviews", async (req, res) => {
    try {
        const reviews = await Review.find().select("-_id email rating text"); // Exclude _id
        res.json(reviews);
    } catch (error) {
        console.error("❌ Error fetching reviews:", error);
        res.status(500).json({ message: "Failed to fetch reviews." });
    }
});

// ✅ Send an Inquiry (Report Issue) - Retrieves Email from Authenticated User
router.post("/report", authenticateUser, async (req, res) => {
    try {
        const { message } = req.body;
        const email = req.user?.email; // ✅ Get user email from authentication

        if (!message) {
            return res.status(400).json({ message: "Message is required." });
        }

        if (!email) {
            return res.status(400).json({ message: "User email is required but was not found in session." });
        }

        console.log(`📩 Sending inquiry from ${email}`);

        // Send email using nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER, // Use environment variables for security
                pass: process.env.GMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: "suvesha2002@gmail.com",
            subject: "Inquiry/Issue Report",
            text: `From: ${email}\n\nMessage:\n${message}`
        });

        res.status(200).json({ message: "📩 Inquiry sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending inquiry:", error);
        res.status(500).json({ message: "Failed to send inquiry." });
    }
});

module.exports = router;


