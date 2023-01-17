import mongoose, { Schema } from "mongoose";
import Config from "../config";

const user = new Schema({
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  emailId: { type: String, trim: true, required: true, unique: true },
  password: { type: String },
  phoneNumber: {
    type: String,
    trim: true,
  },
  userType: {
    type: String,
    default: Config.APP_CONSTANTS.DATABASE.USER_ROLES.USER,
  },
  firstLogin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
  isBlocked: { type: Boolean, default: false, required: true },
});

export default mongoose.model("user", user);
