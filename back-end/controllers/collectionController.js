import User from "../models/User.js";

const ensureSelf = (req, res) => {
  if (req.userId.toString() !== req.params.userId) {
    res.status(403).json({ message: "Forbidden: cannot modify another user's data" });
    return false;
  }
  return true;
};

// POST /api/users/:userId/collections
export const createCollection = async (req, res, next) => {
  try {
    if (!ensureSelf(req, res)) return;

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Collection name is required." });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if a collection with the same name already exists
    const exists = user.collections.find((col) => col.name === name);
    if (exists) {
      return res.status(400).json({ message: "Collection with that name already exists." });
    }

    user.collections.push({ name, items: [] });
    await user.save();

    res.status(201).json({ collections: user.collections });
  } catch (error) {
    console.log("Error in createCollection", error.message);
    next(error);
  }
};

// GET /api/users/:userId/collections
export const getAllCollections = async (req, res, next) => {
  try {
    if (!ensureSelf(req, res)) return;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ collections: user.collections });
  } catch (error) {
    console.log("Error in getAllCollections", error.message);
    next(error);
  }
};

// POST /api/users/:userId/:colName/items
export const addItemToCollection = async (req, res, next) => {
  try {
    if (!ensureSelf(req, res)) return;

    const { colName, userId } = req.params;
    const { artworkId, source } = req.body;

    if (!artworkId || !source) {
      return res.status(400).json({ message: "artworkId and source are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const collection = user.collections.find((col) => col.name === colName);
    if (!collection) {
      return res.status(404).json({ message: `Collection '${colName}' not found.` });
    }

    // Check if this item is already in the collection
    const alreadySaved = collection.items.find(
      (item) => item.artworkId === artworkId && item.source === source
    );
    if (alreadySaved) {
      return res.status(400).json({ message: "Artwork already in this collection." });
    }

    collection.items.push({ artworkId, source, savedAt: new Date() });
    await user.save();
    res.status(201).json({ collections: user.collections });
  } catch (error) {
    console.log("Error in addItemToCollection", error.message);
    next(error);
  }
};

// DELETE /api/users/:userId/collections/:colName/items/:artworkId
export const removeItemFromCollection = async (req, res, next) => {
  try {
    if (!ensureSelf(req, res)) return;

    const { colName, artworkId, userId } = req.params;
    const source = req.query.source;

    if (!source) {
      return res.status(400).json({ message: "source is required as query param." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const collection = user.collections.find((col) => col.name === colName);
    if (!collection) {
      return res.status(404).json({ message: `Collection '${colName}' not found.` });
    }

    // Filter out the matching item
    const originalLength = collection.items.length;
    collection.items = collection.items.filter(
      (item) => !(item.artworkId === artworkId && item.source === source)
    );
    if (collection.items.length === originalLength) {
      return res
        .status(404)
        .json({ message: `Artwork '${artworkId}' ( ${source} ) not found in '${colName}'.` });
    }

    await user.save();
    res.json({ collections: user.collections });
  } catch (error) {
    console.log("Error in removeItemFromCollection", error.message);
    next(error);
  }
};
