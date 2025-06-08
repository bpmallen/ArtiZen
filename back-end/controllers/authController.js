import User from "../models/User.js";
import { hashPassword, comparePasswords, generateToken } from "../lib/utils/auth.js";

// POST /api/user/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: `Username and password are required.` });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters long." });
    }

    // Password must include at least one digit
    if (!/\d/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one number." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    let profileImageUrl = "";
    if (req.file && req.file.path) {
      profileImageUrl = req.file.path; // ← Cloudinary HTTPS URL
    } else if (req.body.profileImageUrl) {
      profileImageUrl = req.body.profileImageUrl; // fallback if they pasted a URL
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: `Username already exists.` });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      username,
      passwordHash,
      profileImageUrl,
      collections: [],
    });

    const token = generateToken(user._id);
    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
      },
      token,
    });
  } catch (error) {
    console.error("Error in register controller:", error);
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: `Username and password are required.` });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Username does not exist" });
    }

    const isMatch = await comparePasswords(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    const token = generateToken(user._id);

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
      },
      token,
    });
  } catch (error) {
    console.log("Error in login controller: ", error.message);
    next(error);
  }
};

// GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    // Because of auth middleware, req.userId is set
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in getMe controller: ", error.message);
    next(error);
  }
};
