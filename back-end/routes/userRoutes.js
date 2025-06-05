import express from "express";
import {
  createCollection,
  getAllCollections,
  addItemToCollection,
  removeItemFromCollection,
  renameCollection,
  deleteCollection,
} from "../controllers/collectionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// POST /api/users/:userId/collections
router.post("/:userId/collections", protect, createCollection);

// GET /api/users/:userId/collections
router.get("/:userId/collections", protect, getAllCollections);

// POST /api/users/:userId/collections/:colName/items
router.post("/:userId/collections/:colName/items", protect, addItemToCollection);

// DELETE /api/users/:userId/collections/:colName/items/:artworkId
router.delete("/:userId/collections/:colName/items/:artworkId", protect, removeItemFromCollection);

// PUT rename an existing collection
router.put("/:userId/collections/:oldName", protect, renameCollection);

// DELETE an entire collection
router.delete("/:userId/collections/:colName", protect, deleteCollection);

router.get("/test", protect, (req, res) => {
  res.json({ message: "Protected user route is working!" });
});

export default router;
