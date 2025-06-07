import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { avatarStorage } from "../lib/cloudinary.js";

const upload = multer({ storage: avatarStorage });

const router = express.Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
