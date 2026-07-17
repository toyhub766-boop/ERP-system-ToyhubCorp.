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
  const balance = party.currentBalance || 0;

  return (
    <button
      onClick={onClick}
      className={`
        w-full rounded-2xl border p-5 text-left
        transition-all duration-200
        ${
          selected
            ? "border-[#17357A] bg-blue-50 shadow-md"
            : "border-slate-200 bg-white hover:border-blue-300 hover:shadow"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            {party.companyName}
          </h3>

          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
            {party.partyType || "Customer"}
          </p>
        </div>

        <div
          className={`h-3 w-3 rounded-full ${
            balance >= 0
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        />
      </div>

      <div className="mt-5">
        <h2
          className={`text-3xl font-bold ${
            balance >= 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          ₹{Math.abs(balance)}
        </h2>

        <p
          className={`mt-1 text-xs font-semibold uppercase ${
            balance >= 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {balance >= 0 ? "You'll Get" : "You'll Give"}
        </p>
      </div>
    </button>
  );
};

export default PartyCard;