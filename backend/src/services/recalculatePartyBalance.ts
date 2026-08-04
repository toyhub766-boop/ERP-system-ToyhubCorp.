import AccountParty from "../models/AccountParty";
import AccountTransaction from "../models/AccountTransaction";

export const recalculatePartyBalance = async (
  partyId: string
) => {
  const party = await AccountParty.findById(partyId);

  if (!party) {
    throw new Error("Party not found");
  }

  let runningBalance = party.openingBalance;

  const transactions = await AccountTransaction.find({
    party: partyId,
  }).sort({
    date: 1,
    createdAt: 1,
  });

  for (const transaction of transactions) {
    if (transaction.transactionType === "MONEY_IN") {
      runningBalance += transaction.amount;
    } else {
      runningBalance -= transaction.amount;
    }

    transaction.balanceAfterTransaction =
      runningBalance;

    await transaction.save();
  }

  party.currentBalance = runningBalance;

  await party.save();

  return runningBalance;
};