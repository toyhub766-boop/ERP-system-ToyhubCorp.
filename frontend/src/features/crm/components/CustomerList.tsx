import { useEffect, useState } from "react";
import { getCustomers } from "../services/customer.service";

interface Props {
  customers: any[];
  selectedCustomer: any;
  setSelectedCustomer: (customer: any) => void;
}

const CustomerList = ({
  selectedCustomer,
  setSelectedCustomer,
}: Props) => {
  const [customers, setCustomers] = useState<any[]>([]);

useEffect(() => {
  loadCustomers();
}, []);

const loadCustomers = async () => {
  try {
    const data = await getCustomers();
    setCustomers(data);
  } catch (error) {
    console.error(error);
  }
};
  return (
  <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

    {/* Header */}

    <div className="border-b border-slate-200 p-6">

      <h2 className="text-xl font-bold text-slate-900">
        Customers
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Browse and select a customer to view their profile.
      </p>

      <input
        type="text"
        placeholder="Search customers..."
        className="
          mt-5
          h-12
          w-full
          rounded-xl
          border
          border-slate-300
          bg-white
          px-4
          text-sm
          outline-none
          transition
          focus:border-[#172B6B]
          focus:ring-4
          focus:ring-blue-100
        "
      />

    </div>

    {/* Customer List */}

    <div className="max-h-[700px] overflow-y-auto">

      {customers.length === 0 ? (

        <div className="flex h-72 flex-col items-center justify-center text-slate-500">

          <div className="mb-4 text-5xl">
            👥
          </div>

          <p className="font-semibold">
            No Customers Found
          </p>

        </div>

      ) : (

        customers.map((customer) => {

          const selected =
            selectedCustomer?._id === customer._id;

          return (

            <button
              key={customer._id}
              onClick={() =>
                setSelectedCustomer(customer)
              }
              className={`
                w-full
                border-b
                p-5
                text-left
                transition-all
                duration-200

                ${
                  selected
                    ? "border-l-4 border-l-[#172B6B] bg-blue-50"
                    : "hover:bg-slate-50"
                }
              `}
            >

              <div className="flex items-start justify-between">

                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-lg font-semibold text-slate-900">
                    {customer.contactPerson ||
                      customer.name}
                  </h3>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {customer.companyName ||
                      customer.company ||
                      "-"}
                  </p>

                </div>

                {selected && (
                  <span className="rounded-full bg-[#172B6B] px-3 py-1 text-xs font-semibold text-white">
                    Active
                  </span>
                )}

              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                <div>

                  <p className="text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 font-medium text-slate-700">
                    {customer.phone || "-"}
                  </p>

                </div>

                <div>

                  <p className="text-slate-400">
                    City
                  </p>

                  <p className="mt-1 font-medium text-slate-700">
                    {customer.city || "-"}
                  </p>

                </div>

              </div>

            </button>

          );

        })

      )}

    </div>

  </div>
);
};



export default CustomerList;