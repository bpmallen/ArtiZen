import JWT from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith(`Bearer `)) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorised, no token" });
  }

  try {
    const decoded = JWT.verify(token, JWT_SECRET);
    req.userId = decoded.is;
    next();
  } catch (error) {
    console.error(err);
    return res.status(401).json({ message: "Not authorised, token failed." });
  }
};
