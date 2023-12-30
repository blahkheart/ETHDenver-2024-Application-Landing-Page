import mongoose from "mongoose";

export interface EventDocument extends mongoose.Document {
  integrationId: mongoose.Schema.Types.ObjectId;
  tierId: mongoose.Schema.Types.ObjectId;
  name: string;
  createdBy?: mongoose.Schema.Types.ObjectId;
}

const eventSchema = new mongoose.Schema<EventDocument>(
  {
    integrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Integration",
      required: true,
    },
    tierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tier",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscriber",
    },
  },
  {
    timestamps: true,
  },
);

const Event = mongoose.models.Events || mongoose.model("Events", eventSchema);
export default Event;
