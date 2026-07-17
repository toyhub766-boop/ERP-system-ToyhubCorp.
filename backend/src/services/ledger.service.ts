import Customer from "../models/customer";
import AccountTransaction from "../models/AccountTransaction";

export const recalculateCustomerBalance = async (
  customerId: string
) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  let runningBalance = customer.openingBalance;

  const transactions = await AccountTransaction.find({
    customer: customerId,
  }).sort({ date: 1, createdAt: 1 });

  for (const transaction of transactions) {
    if (transaction.transactionType === "MONEY_IN") {
      runningBalance += transaction.amount;
    } else {
      runningBalance -= transaction.amount;
    }

    transaction.balanceAfterTransaction = runningBalance;
    await transaction.save();
  }

  customer.currentBalance = runningBalance;
  await customer.save();

  return runningBalance;
};