import express from "express";
import {
  createCollection,
  getAllCollections,
  addItemToCollection,
  removeItemFromCollection,
} from "../controllers/collectionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// POST /api/users/:userId/collections
router.post("/:userId/collections", createCollection);

// GET /api/users/:userId/collections
router.get("/:userId/collections", getAllCollections);

// POST /api/users/:userId/collections/:colName/items
router.post("/:userId/collections/:colName/items", addItemToCollection);

// DELETE /api/users/:userId/collections/:colName/items/:artworkId
router.delete("/:userId/collections/:colName/items/:artworkId", removeItemFromCollection);

router.get("/test", protect, (req, res) => {
  res.json({ message: "Protected user route is working!" });
});

export default router;
