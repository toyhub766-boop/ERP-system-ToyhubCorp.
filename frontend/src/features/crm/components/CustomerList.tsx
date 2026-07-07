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
    <div className="bg-white border border-slate-200 rounded-2xl">

      <div className="p-5 border-b border-slate-200">

        <input
          type="text"
          placeholder="Search customers..."
          className="
            w-full
            px-4
            py-3
            border
            border-slate-300
            rounded-xl
            outline-none
            focus:border-[#172B6B]
          "
        />

      </div>

      <div className="max-h-[620px] overflow-y-auto">

        {customers.map((customer) => {

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
                text-left
                p-5
                border-b
                transition
                ${
                  selected
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-slate-50 border-slate-100"
                }
              `}
            >

              <h3 className="font-semibold">
                {customer.name}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {customer.company || "-"}
              </p>

              <div className="mt-3 text-sm text-slate-500 space-y-1">

                <p>{customer.phone || "-"}</p>

                <p>{customer.city}</p>

              </div>

            </button>

          );
        })}

      </div>

    </div>
  );
};



export default CustomerList;