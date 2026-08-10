import mongoose, { Schema, Document } from "mongoose";

export interface IChecklistItem {
  text: string;
  completed: boolean;
}

export interface ITask extends Document {
  title: string;
  description?: string;

  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;

  priority: "Low" | "Medium" | "High";

  dueDate?: Date;

  remarks?: string;

  completed: boolean;

  checklist: IChecklistItem[];
}

const checklistItemSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

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

    dueDate: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      default: "",
    },

    completed: {
      type: Boolean,
      default: false,
    },

    checklist: {
      type: [checklistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);