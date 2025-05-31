import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// TODO
// GET /api/users/:userId/collections
// POST /api/users/:userId/collections
// POST /api/users/:userId/collections/:colName/items
// DELETE /api/users/:userId/collections/:colName/items/:artworkId

router.get("/test", protect, (req, res) => {
  res.json({ message: "Protected user route is working!" });
});

export default router;
