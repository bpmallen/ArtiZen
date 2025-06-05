import User from "../models/User.js";

// PUT /api/users/:userId
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { profileImageUrl } = req.body;

    if (req.userId !== userId) {
      return res.status(403).json({ message: "Forbidden: cannot update other users." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (profileImageUrl !== undefined) {
      user.profileImageUrl = profileImageUrl;
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.passwordHash;
    return res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error("Error in updateUser controller:", error);
    next(error);
  }
};
