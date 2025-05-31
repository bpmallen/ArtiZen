import mongoose from "mongoose";

const { Schema, model } = mongoose;

const collectionItemSchema = new Schema(
  {
    artworkId: { type: String, required: true },
    source: {
      type: String,
      enum: [`met`, `harvard`],
      required: true,
    },
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false } // prevents assigning automatic _id for each item
);

const collectionSchema = new Schema(
  {
    name: { type: String, required: true },
    items: [collectionItemSchema],
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    profileImageUrl: { type: String, default: "" },
    collections: [collectionSchema],
  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
