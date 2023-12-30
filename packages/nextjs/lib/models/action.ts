import mongoose from "mongoose";

export interface ActionDocument extends mongoose.Document {
  integrationId: mongoose.Schema.Types.ObjectId;
  tierId: mongoose.Schema.Types.ObjectId;
  name: string;
  createdBy: mongoose.Schema.Types.ObjectId;
}

const actionSchema = new mongoose.Schema<ActionDocument>(
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
      ref: "Event",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Action = mongoose.models.Actions || mongoose.model("Actions", actionSchema);
export default Action;
