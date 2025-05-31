import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectMongoDB.js";
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
