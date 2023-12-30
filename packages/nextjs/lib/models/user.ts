import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  address: string;
}
const userSchema = new mongoose.Schema<UserDocument>(
  {
    address: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.models.Users || mongoose.model("Users", userSchema);

export default User;
