import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;

  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;

  priority: "Low" | "Medium" | "High";

  status: "Pending" | "In Progress" | "Completed";

  dueDate?: Date;

  remarks?: string;
}

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Completed",
      ],
      default: "Pending",
    },

    dueDate: Date,

    remarks: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Task",
  taskSchema
);