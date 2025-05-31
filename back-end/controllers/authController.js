import User from "../models/User.js";
import { hashPassword, comparePasswords, generateToken } from "../lib/utils/auth.js";

// POST /api/user/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, password, profileImageUrl } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: `Username and password are required.` });
    }

    // check if username already exists
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: `Username already exists.` });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      username,
      passwordHash,
      profileImageUrl: profileImageUrl || "",
      collections: [],
    });

    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
      },
      token,
    });
  } catch (error) {
    console.log("Error in register controller: ", error.message);
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
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePasswords(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      user: {
        id: user._id,
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
