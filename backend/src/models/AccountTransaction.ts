import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IAccountTransaction
  extends Document {
  party: mongoose.Types.ObjectId;

  transactionType:
    | "MONEY_IN"
    | "MONEY_OUT";

  amount: number;

  paymentMethod:
    | "Cash"
    | "Bank Transfer"
    | "Cheque"
    | "UPI"
    | "Other";

  utrNumber?: string;

  otherReason?: string;

  attachment?: string;

  remarks?: string;

  balanceAfterTransaction: number;

  createdBy?: mongoose.Types.ObjectId;

  date: Date;
}

const accountTransactionSchema =
  new Schema<IAccountTransaction>(
    {
      party: {
        type: Schema.Types.ObjectId,
        ref: "AccountParty",
        required: true,
      },

      transactionType: {
        type: String,
        enum: [
          "MONEY_IN",
          "MONEY_OUT",
        ],
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      paymentMethod: {
        type: String,
        enum: [
          "Cash",
          "UPI",
          "Bank Transfer",
          "Cheque",
          "Other",
        ],
        default: "Cash",
      },

      utrNumber: {
        type: String,
        default: "",
      },

      otherReason: {
        type: String,
        default: "",
      },

      attachment: {
        type: String,
        default: "",
      },

      remarks: {
        type: String,
        default: "",
      },

      balanceAfterTransaction: {
        type: Number,
        required: true,
      },

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      date: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IAccountTransaction>(
  "AccountTransaction",
  accountTransactionSchema
);