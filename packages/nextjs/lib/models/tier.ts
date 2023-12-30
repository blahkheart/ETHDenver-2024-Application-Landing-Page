import mongoose from "mongoose";


export interface TierDocument extends mongoose.Document {
  id: string;
  name: string;
  monthlyLockAddress: string;
  yearlyLockAddress: string;
  network: number;
  description: string;
  type: string;
  visibility: string;
  monthlyPrice: number;
  yearlyPrice: number;
  welcomePageUrl: string;
  currency: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  integrationId: mongoose.Schema.Types.ObjectId;
}

const tierSchema = new mongoose.Schema<TierDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    monthlyLockAddress: { type: String, required: true, unique: true },
    yearlyLockAddress: { type: String, required: true, unique: true },
    network: { type: Number, required: true },
    description: { type: String },
    type: { type: String },
    visibility: { type: String },
    monthlyPrice: { type: Number },
    yearlyPrice: { type: Number },
    welcomePageUrl: { type: String },
    currency: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth-api.User",
      required: true,
    },
    integrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Integration",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Tier = mongoose.models.Tiers || mongoose.model("Tiers", tierSchema);
export default Tier;