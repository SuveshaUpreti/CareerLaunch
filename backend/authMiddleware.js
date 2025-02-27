const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.error("❌ No token provided.");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.email) {
      console.error("❌ No email found in JWT token!");
      return res.status(403).json({ message: "Invalid token: Email missing" });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    console.log("✅ Authenticated User:", req.user);
    next();
  } catch (error) {
    console.error("❌ Token Verification Error:", error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authenticateUser };
