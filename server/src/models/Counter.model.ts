import { Schema, model } from "mongoose";

const counterSchema = new Schema(
  {
    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

counterSchema.index({ seq: 1 }, { unique: true });

export default model("Counter", counterSchema);
