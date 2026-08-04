import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IReminder
  extends Document {

  title: string;

  description?: string;

  module:
    | "CRM"
    | "ACCOUNTS";

  relatedId?:
    mongoose.Types.ObjectId;

  assignedTo?:
    mongoose.Types.ObjectId;

  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  status:
    | "PENDING"
    | "COMPLETED";

  dueDate: Date;

  completedAt?: Date;

  createdBy?:
    mongoose.Types.ObjectId;
}

const reminderSchema =
  new Schema<IReminder>(
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

      module: {
        type: String,
        enum: [
          "CRM",
          "ACCOUNTS",
        ],
        required: true,
      },

      relatedId: {
        type: Schema.Types.ObjectId,
      },

      assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      priority: {
        type: String,
        enum: [
          "LOW",
          "MEDIUM",
          "HIGH",
        ],
        default: "MEDIUM",
      },

      status: {
        type: String,
        enum: [
          "PENDING",
          "COMPLETED",
        ],
        default: "PENDING",
      },

      dueDate: {
        type: Date,
        required: true,
      },

      completedAt: {
        type: Date,
      },

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IReminder>(
  "Reminder",
  reminderSchema
);