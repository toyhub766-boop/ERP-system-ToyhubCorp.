interface Props {
  onAddCustomer: () => void;
  isStaff?: boolean;
}

const CRMHeader = ({
  onAddCustomer,
  isStaff = false,
}: Props) => {
 return (
  <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

    <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">

      {/* Left */}

      <div>

        <p className="text-sm font-medium text-slate-500">
          {isStaff ? "CRM Staff" : "Admin > CRM"}
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Customer Relationship Management
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Manage customers, sales orders, payment records, and outstanding balances
          from a single workspace.
        </p>

      </div>

      {/* Right */}

      <div className="flex flex-wrap gap-3">

        <button
          onClick={onAddCustomer}
          className="
            inline-flex
            items-center
            gap-2
            rounded-2xl
            bg-[#172B6B]
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[#20398F]
          "
        >
          <span className="text-lg">+</span>
          Add Customer
        </button>

      </div>

    </div>

  </div>
);
};

export default CRMHeader;