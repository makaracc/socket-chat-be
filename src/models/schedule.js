import mongoose, { Schema } from "mongoose";
import Config from "../config";

const schedule = new Schema({
  shift: { type: String },
  title: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  icon: {
    type: String,
    trim: true,
  },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

export default mongoose.model("schedule", schedule);
