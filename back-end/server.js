import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // ← import this!
import { connectDB } from "./db/connectMongoDB.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ALLOWED_ORIGINS = ["http://localhost:5173", "https://artizen-curation.netlify.app"];

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      if (!incomingOrigin || ALLOWED_ORIGINS.includes(incomingOrigin)) {
        // no incomingOrigin means things like mobile apps or Postman—allow if you like
        return callback(null, true);
      }
      callback(new Error(`Origin ${incomingOrigin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const host = process.env.HOSTNAME || "localhost";
  console.log(`✅ Server is running on http://${host}:${PORT}`);
  connectDB();
});
