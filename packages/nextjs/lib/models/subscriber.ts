import mongoose from "mongoose";

export interface SubscriberDocument extends mongoose.Document {
  id: string;
  email: string;
  address: string;
  tiers: {
    tier: mongoose.Types.ObjectId;
    isActive: boolean;
  }[];
  startDate: number;
  endDate: number;
}

const subscriberSchema = new mongoose.Schema<SubscriberDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
      unique: true,
    },
    tiers: [
      {
        tier: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tier",
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    startDate: { type: Number, default: Date.now },
    endDate: { type: Number },
  },
  {
    timestamps: true,
  },
);

const Subscriber = mongoose.models.Subscribers || mongoose.model("Subscribers", subscriberSchema);
export default Subscriber;