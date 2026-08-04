interface Props {
  party: any;
  selected: boolean;
  onClick: () => void;
}

const PartyCard = ({
  party,
  selected,
  onClick,
}: Props) => {
  const customer =
    party.customerDetails;

  const supplier =
    party.supplierDetails;

  const dueDate =
    customer?.dueDate ||
    supplier?.dueDate;

  const balance =
    party.currentBalance || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-[#17357A] bg-blue-50 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Top */}

      <div className="flex items-start justify-between">

        <div>

          <h3 className="font-semibold text-slate-900">
            {party.companyName}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {party.contactPerson ||
              "--"}
          </p>

        </div>

        <span
          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
            party.partyType ===
            "CUSTOMER"
              ? "bg-blue-100 text-blue-700"
              : party.partyType ===
                "SUPPLIER"
              ? "bg-orange-100 text-orange-700"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {party.partyType.replace(
            "_",
            " "
          )}
        </span>

      </div>

      {/* Middle */}

      <div className="mt-4 grid grid-cols-2 gap-y-3 text-xs">

        <div>

          <p className="text-slate-400">
            Phone
          </p>

          <p className="font-medium">
            {party.phone || "--"}
          </p>

        </div>

        <div>

          <p className="text-slate-400">
            Due Date
          </p>

          <p className="font-medium">

            {dueDate
              ? new Date(
                  dueDate
                ).toLocaleDateString()
              : "--"}

          </p>

        </div>

      </div>

      {/* Bottom */}

      <div className="mt-5 flex items-center justify-between border-t pt-4">

        <div>

          <p className="text-xs text-slate-400">
            Balance
          </p>

          <h3
            className={`font-bold ${
              balance >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            ₹
            {Math.abs(balance)}
          </h3>

        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            balance >= 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {balance >= 0
            ? "You'll Get"
            : "You'll Give"}
        </div>

      </div>

    </button>
  );
};

export default PartyCard;