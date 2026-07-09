interface Props {
  onAddCustomer: () => void;
  isStaff?: boolean;
}

const CRMHeader = ({
  onAddCustomer,
  isStaff = false,
}: Props) => {
  return (
    <div className="flex items-start justify-between">

      <div>

        <p className="text-sm text-slate-500">
          {isStaff ? "CRM Staff" : "Admin > CRM"}
        </p>

        <h1 className="text-3xl font-bold mt-2">
          CRM — Customer Management
        </h1>

        <p className="text-slate-500 mt-1">
          Customers, orders, and payment tracking
        </p>

      </div>

      <button
        onClick={onAddCustomer}
        className="
          bg-[#172B6B]
          hover:bg-[#223a88]
          text-white
          px-6
          py-3
          rounded-xl
          font-medium
        "
      >
        + Add Customer
      </button>

    </div>
  );
};

export default CRMHeader;