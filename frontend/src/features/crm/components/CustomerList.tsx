import {
  FiSearch,
  FiPhone,
  FiUsers,
} from "react-icons/fi";

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
  const filteredCustomers = customers.filter(
    (customer) => {
      const q = search.toLowerCase().trim();

      return (
        customer.companyName
          ?.toLowerCase()
          .includes(q) ||
        customer.contactPerson
          ?.toLowerCase()
          .includes(q) ||
        customer.phone
          ?.toLowerCase()
          .includes(q) ||
        customer.customerCode
          ?.toLowerCase()
          .includes(q) ||
        customer.gstNumber
          ?.toLowerCase()
          .includes(q)
      );
    }
  );

  return (
    <section
      className="
        flex
        min-h-0
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          shrink-0
          border-b
          border-slate-100
          px-5
          py-5
          sm:px-6
        "
      >
        <div className="flex items-start justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-[#172B6B]
                "
              >
                <FiUsers size={18} />
              </div>

              <div>
                <h2
                  className="
                    text-lg
                    font-bold
                    tracking-tight
                    text-slate-900
                  "
                >
                  Customers
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Manage customer relationships
                </p>
              </div>

            </div>
          </div>

          <span
            className="
              shrink-0
              rounded-full
              bg-slate-100
              px-3
              py-1.5
              text-xs
              font-semibold
              text-slate-600
            "
          >
            {filteredCustomers.length}
          </span>

        </div>
      </div>


      {/* =====================================================
          SEARCH + FILTER SUMMARY
      ===================================================== */}

      <div
        className="
          shrink-0
          border-b
          border-slate-100
          px-5
          py-4
          sm:px-6
        "
      >

        {/* Search */}

        <div className="relative">

          <FiSearch
            size={17}
            className="
              pointer-events-none
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search customers..."
            className="
              h-11
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-10
              pr-4
              text-sm
              text-slate-800
              outline-none
              transition-all
              duration-200
              placeholder:text-slate-400
              focus:border-[#172B6B]
              focus:bg-white
              focus:ring-4
              focus:ring-blue-50
            "
          />

        </div>


        {/* Summary */}

        <div className="mt-3 flex flex-wrap gap-2">

          <span
            className="
              rounded-full
              bg-blue-50
              px-3
              py-1.5
              text-[11px]
              font-semibold
              text-blue-700
            "
          >
            {customers.length} Customers
          </span>

          <span
            className="
              rounded-full
              bg-emerald-50
              px-3
              py-1.5
              text-[11px]
              font-semibold
              text-emerald-700
            "
          >
            {
              customers.filter(
                (c) => c.status === "Active"
              ).length
            } Active
          </span>

          <span
            className="
              rounded-full
              bg-amber-50
              px-3
              py-1.5
              text-[11px]
              font-semibold
              text-amber-700
            "
          >
            {
              customers.filter(
                (c) => c.stage === "LEAD"
              ).length
            } Leads
          </span>

        </div>

      </div>


      {/* =====================================================
          SCROLLABLE CUSTOMER LIST
      ===================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-4
          py-4
          sm:px-5
          [scrollbar-width:thin]
          [scrollbar-color:#CBD5E1_transparent]
        "
      >

        <div className="space-y-3">

          {!filteredCustomers.length ? (

            <div
              className="
                flex
                min-h-[280px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-slate-200
                bg-slate-50/50
                px-6
                text-center
              "
            >

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-slate-400
                  shadow-sm
                "
              >
                <FiSearch size={20} />
              </div>

              <h3
                className="
                  mt-4
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                No customers found
              </h3>

              <p
                className="
                  mt-1
                  max-w-xs
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Try searching with a different
                company name, contact, phone or
                customer code.
              </p>

            </div>

          ) : (

            filteredCustomers.map(
              (customer) => {

                const selected =
                  selectedCustomer?._id ===
                  customer._id;

                return (
                  <button
                    key={customer._id}
                    type="button"
                    onClick={() =>
                      setSelectedCustomer(
                        customer
                      )
                    }
                    className={`
                      group
                      w-full
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition-all
                      duration-200
                      ${
                        selected
                          ? `
                            border-[#172B6B]
                            bg-blue-50/60
                            shadow-sm
                          `
                          : `
                            border-slate-200
                            bg-white
                            hover:-translate-y-0.5
                            hover:border-slate-300
                            hover:shadow-sm
                          `
                      }
                    `}
                  >

                    {/* Main information */}

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >

                      <div className="flex min-w-0 gap-3">

                        <div
                          className={`
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            text-sm
                            font-bold
                            ${
                              selected
                                ? "bg-[#172B6B] text-white"
                                : "bg-slate-100 text-[#172B6B]"
                            }
                          `}
                        >
                          {customer.companyName
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                        </div>

                        <div className="min-w-0">

                          <h3
                            className="
                              truncate
                              text-sm
                              font-bold
                              text-slate-900
                            "
                          >
                            {customer.companyName}
                          </h3>

                          <p
                            className="
                              mt-0.5
                              truncate
                              text-xs
                              text-slate-500
                            "
                          >
                            {customer.contactPerson}
                          </p>

                          <p
                            className="
                              mt-1.5
                              flex
                              items-center
                              gap-1.5
                              text-xs
                              text-slate-400
                            "
                          >
                            <FiPhone size={12} />
                            {customer.phone || "--"}
                          </p>

                        </div>

                      </div>


                      {/* Status */}

                      <span
                        className={`
                          shrink-0
                          rounded-full
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          ${
                            customer.status ===
                            "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }
                        `}
                      >
                        {customer.status}
                      </span>

                    </div>


                    {/* Tags */}

                    <div
                      className="
                        mt-4
                        flex
                        flex-wrap
                        gap-1.5
                      "
                    >

                      {customer.stage && (
                        <span
                          className="
                            rounded-lg
                            bg-slate-100
                            px-2.5
                            py-1
                            text-[10px]
                            font-semibold
                            text-slate-600
                          "
                        >
                          {customer.stage}
                        </span>
                      )}

                      {customer.category && (
                        <span
                          className="
                            rounded-lg
                            bg-blue-50
                            px-2.5
                            py-1
                            text-[10px]
                            font-semibold
                            text-blue-700
                          "
                        >
                          {customer.category}
                        </span>
                      )}

                      {customer.partyType && (
                        <span
                          className="
                            rounded-lg
                            bg-purple-50
                            px-2.5
                            py-1
                            text-[10px]
                            font-semibold
                            text-purple-700
                          "
                        >
                          {customer.partyType}
                        </span>
                      )}

                    </div>


                    {/* Bottom information */}

                    <div
                      className="
                        mt-4
                        flex
                        items-end
                        justify-between
                        border-t
                        border-slate-100
                        pt-3
                      "
                    >

                      <div>

                        <p
                          className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.08em]
                            text-slate-400
                          "
                        >
                          Outstanding
                        </p>

                        <p
                          className={`
                            mt-1
                            text-sm
                            font-bold
                            ${
                              Number(
                                customer.currentBalance ||
                                  0
                              ) > 0
                                ? "text-rose-600"
                                : "text-emerald-600"
                            }
                          `}
                        >
                          ₹
                          {Number(
                            customer.currentBalance ||
                              0
                          ).toLocaleString("en-IN")}
                        </p>

                      </div>


                      <div className="text-right">

                        <p
                          className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.08em]
                            text-slate-400
                          "
                        >
                          Code
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            font-semibold
                            text-slate-700
                          "
                        >
                          {customer.customerCode ||
                            "--"}
                        </p>

                      </div>

                    </div>

                  </button>
                );
              }
            )

          )}

        </div>

      </div>

    </section>
  );
};

export default CustomerList;