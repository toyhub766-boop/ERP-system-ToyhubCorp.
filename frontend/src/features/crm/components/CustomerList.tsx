interface Props {
  customers: any[];

  selectedCustomer: any;

  setSelectedCustomer: (
    customer: any
  ) => void;

  search: string;

  setSearch: React.Dispatch<
    React.SetStateAction<string>
  >;
}

const CustomerList = ({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  search,
  setSearch,
}: Props) => {

  const filteredCustomers =
    customers.filter((customer) => {

      const q = search.toLowerCase();

      return (

        customer.companyName
          ?.toLowerCase()
          .includes(q)

        ||

        customer.contactPerson
          ?.toLowerCase()
          .includes(q)

        ||

        customer.phone
          ?.toLowerCase()
          .includes(q)

        ||

        customer.customerCode
          ?.toLowerCase()
          .includes(q)

        ||

        customer.gstNumber
          ?.toLowerCase()
          .includes(q)

      );

    });

  return (

    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-slate-200 p-6">

        <h2 className="text-2xl font-bold text-slate-900">
          Customers
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage customer relationships
        </p>

      </div>

      {/* Search */}

      <div className="p-6">

        <div className="relative">

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search customers..."
            className="
              h-12
              w-full
              rounded-xl
              border
              border-slate-300
              pl-11
              pr-4
              outline-none
              transition
              focus:border-[#172B6B]
              focus:ring-4
              focus:ring-blue-100
            "
          />

        </div>

                {/* Filters */}

        <div className="mt-5 flex flex-wrap gap-2">

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {customers.length} Customers
          </span>

          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            {
              customers.filter(
                (c) => c.status === "Active"
              ).length
            }{" "}
            Active
          </span>

          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {
              customers.filter(
                (c) =>
                  c.stage === "LEAD"
              ).length
            }{" "}
            Leads
          </span>

        </div>

      </div>

      {/* Customer List */}

      <div className="max-h-[700px] space-y-3 overflow-y-auto p-4">

        {!filteredCustomers.length ? (

          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">

            <div className="text-5xl">
              🔍
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-800">
              No Customers Found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try another search keyword.
            </p>

          </div>

        ) : (

          filteredCustomers.map(
            (customer) => (

              <button
                key={customer._id}
                onClick={() =>
                  setSelectedCustomer(customer)
                }
                className={`w-full rounded-2xl border p-5 text-left transition-all

                ${
                  selectedCustomer?._id ===
                  customer._id
                    ? "border-[#172B6B] bg-blue-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-[#172B6B]/30 hover:shadow-sm"
                }`}
              >

                <div className="flex items-start justify-between">

                  <div className="flex gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#172B6B] text-lg font-bold text-white">

                      {customer.companyName
                        ?.charAt(0)
                        ?.toUpperCase()}

                    </div>

                    <div>

                      <h3 className="text-base font-bold text-slate-900">

                        {customer.companyName}

                      </h3>

                      <p className="mt-1 text-sm text-slate-600">

                        {customer.contactPerson}

                      </p>

                      <p className="mt-1 text-xs text-slate-500">

                        📞 {customer.phone}

                      </p>

                    </div>

                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold

                    ${
                      customer.status ===
                      "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {customer.status}
                  </span>

                </div>

                <div className="mt-5 flex flex-wrap gap-2">

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">

                    {customer.stage}

                  </span>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">

                    {customer.category}

                  </span>

                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">

                    {customer.partyType}

                  </span>

                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                  <div>

                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Outstanding
                    </p>

                    <p className="text-lg font-bold text-red-600">

                      ₹
                      {customer.currentBalance || 0}

                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Code
                    </p>

                    <p className="font-semibold text-slate-700">

                      {customer.customerCode}

                    </p>

                  </div>

                </div>

              </button>

            )
          )

        )}

              </div>

    </div>

  );

};

export default CustomerList;