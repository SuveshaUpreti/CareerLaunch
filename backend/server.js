require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const apiRoutes = require("./api"); // ✅ Import API routes

// Ensure environment variables are set
if (!MONGO_URI || !JWT_SECRET || !GEMINI_API_KEY) {
  console.error("❌ Error: Missing environment variables!");
  process.exit(1);
}

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Authentication Middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ User Model
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// ✅ Profile Schema
const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  address: String,
  linkedin: String,
  email: String,
  phone: String,
  uniqueTraits: [String],
  resume: String,
});

const Profile = mongoose.model("Profile", ProfileSchema);

// ✅ Authentication Routes
const authRouter = express.Router();
app.use("/auth", authRouter);

// ✅ Register User & Auto Create Profile
authRouter.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    const newProfile = new Profile({
      userId: newUser._id,
      name: "",
      address: "",
      linkedin: "",
      email: email,
      phone: "",
      uniqueTraits: ["", "", ""],
      resume: "",
    });

    await newProfile.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Issue a new token on login
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error("❌ Login Server Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});




// ✅ Profile Routes
const profileRouter = express.Router();

// ✅ Save or Update Profile (Authenticated)
profileRouter.post("/", authenticateUser, async (req, res) => {
  try {
    const { name, address, linkedin, email, phone, uniqueTraits, resume } = req.body;

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { name, address, linkedin, email, phone, uniqueTraits, resume },
      { upsert: true, new: true }
    );

    res.json({ message: "Profile saved successfully", profile: updatedProfile });
  } catch (error) {
    console.error("❌ Profile Save Error:", error);
    res.status(500).json({ message: "Failed to save profile", error });
  }
});

// ✅ Get Profile (Authenticated)
profileRouter.get("/", authenticateUser, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.json(profile);
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({ message: "Failed to retrieve profile", error });
  }
});

app.use("/api/profile", profileRouter);
// ✅ Use API routes
app.use("/api", apiRoutes);

app.post("/api/generate-chronological-cover-letter", async (req, res) => {
  try {
    const { profile, jobDescription } = req.body;
    if (!profile || !jobDescription) {
      return res.status(400).json({ message: "Profile and job description are required" });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Write a professional and tailored cover letter for the role of ${jobDescription} at the respective company, incorporating the following structure:

**Dear [Hiring Manager Name],**

I am writing to express my keen interest in the ${jobDescription} position with [Company Name], as advertised on [Platform where you saw the job posting]. As a highly motivated and results-oriented Software Engineer with a Bachelor of Science in Computer Science from Texas State University and over two years of experience in full-stack development, I am confident my skills and experience align perfectly with the requirements of this role. My proficiency in JavaScript, Python, and SQL, coupled with my experience building and deploying responsive web applications, make me a strong candidate.

**Paragraph 2:**  
Highlight your relevant projects and skills that directly relate to the job description. Address specific skills mentioned in the job posting that are not explicitly in your resume, and express how you have some experience with them or a strong willingness to learn.

**Paragraph 3:**  
Conclude by emphasizing the unique traits that set you apart from other candidates. End with a strong closing statement expressing enthusiasm for the role and the company's mission.

Here is my profile data to personalize the letter:
${JSON.stringify(profile, null, 2)}

Do **not** include personal information such as [Your Name], [Your Address], or [Your Phone Number]. Do **not** include empty fields such as [Date] if no data is available. Ensure that the letter sounds professional, confident, and tailored to the role.`
              }
            ]
          }
        ]
      }
    );

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate cover letter.";
    res.json({ coverLetter: generatedText });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate cover letter", error });
  }
});



app.post("/api/generate-short-cover-letter", async (req, res) => {
  try {
    const { profile, jobDescription } = req.body;
    if (!profile || !jobDescription) {
      return res.status(400).json({ message: "Profile and job description are required" });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Write a **concise and compelling** short cover letter for the position of **${jobDescription}** that follows this structure:

**Paragraph 1:**  
Introduce yourself and express your interest in applying for this role at the company. Mention your degree and key skills briefly, along with why this opportunity excites you.

**Paragraph 2:**  
Provide **five strong reasons** why you are an excellent fit for the position:
- **Two points** should highlight **unique qualities** from my profile that make me stand out, such as my involvement in leadership roles like Vice President of .EXE, my unique experience with full-stack development, or my work on personalized task manager apps.
- **Three points** should focus on **skills that match the job description**, including key abilities you already possess (e.g., proficiency in JavaScript, Python, SQL, etc.), and additional skills relevant to the role.

Ensure the letter is **professional, confident, and impactful**. Keep the wording concise and avoid empty fields like [date], ensuring the letter is direct and tailored to the job.

Here is my profile data to personalize the letter:
${JSON.stringify(profile, null, 2)}

**Do not** include placeholders such as [Your Name], [Your Address], or [Date], and make sure to omit any empty fields. Focus only on the unique qualities and key skills that directly relate to the job.`
              }
            ]
          }
        ]
      }
    );

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate cover letter.";
    res.json({ coverLetter: generatedText });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate cover letter", error });
  }
});


// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
