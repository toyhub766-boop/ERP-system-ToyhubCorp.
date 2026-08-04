import { useMemo, useState } from "react";

import PartyCard from "./PartyCard";

interface Props {
  parties: any[];

  selectedParty: any;

  setSelectedParty: (
    party: any
  ) => void;

  onAddParty: () => void;
}

const PartyList = ({
  parties,
  selectedParty,
  setSelectedParty,
  onAddParty,
}: Props) => {

const [search,setSearch]=
useState("");

const [filter,setFilter]=
useState("ALL");

const [sort,setSort]=
useState("LATEST");

const filteredParties=
useMemo(()=>{

let data=[...parties];

if(search){

const term=
search.toLowerCase();

data=data.filter(

party=>

party.companyName
.toLowerCase()
.includes(term)

);

}

if(filter!=="ALL"){

data=data.filter(

party=>

party.partyType===filter

);

}

switch(sort){

case "OLDEST":

data.sort(

(a,b)=>

new Date(a.createdAt)
.getTime()

-

new Date(b.createdAt)
.getTime()

);

break;

case "HIGHEST":

data.sort(

(a,b)=>

b.currentBalance-
a.currentBalance

);

break;

case "LOWEST":

data.sort(

(a,b)=>

a.currentBalance-
b.currentBalance

);

break;

default:

data.sort(

(a,b)=>

new Date(b.createdAt)
.getTime()

-

new Date(a.createdAt)
.getTime()

);

}

return data;

},[
parties,
search,
filter,
sort,
]);

const customers=
filteredParties.filter(

p=>p.partyType==="CUSTOMER"

);

const suppliers=
filteredParties.filter(

p=>p.partyType==="SUPPLIER"

);

const expenses=
filteredParties.filter(

p=>

p.partyType==="COMPANY_EXPENSE"

);

return(

<div className="flex h-full flex-col">

{/* ================= HEADER ================= */}

<div className="border-b border-slate-200 bg-white p-5 space-y-4">

  <input
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
    placeholder="Search Party..."
    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#17357A]"
  />

  <div className="grid grid-cols-2 gap-3">

    <select
      value={filter}
      onChange={(e)=>setFilter(e.target.value)}
      className="rounded-xl border border-slate-300 px-4 py-3"
    >
      <option value="ALL">
        All
      </option>

      <option value="CUSTOMER">
        Customers
      </option>

      <option value="SUPPLIER">
        Suppliers
      </option>

      <option value="COMPANY_EXPENSE">
        Company Expense
      </option>

    </select>

    <select
      value={sort}
      onChange={(e)=>setSort(e.target.value)}
      className="rounded-xl border border-slate-300 px-4 py-3"
    >

      <option value="LATEST">
        Latest
      </option>

      <option value="OLDEST">
        Oldest
      </option>

      <option value="HIGHEST">
        Highest Balance
      </option>

      <option value="LOWEST">
        Lowest Balance
      </option>

    </select>

  </div>

  <button
    onClick={onAddParty}
    className="w-full rounded-xl bg-[#17357A] py-3 font-semibold text-white hover:bg-[#20459D]"
  >
    + Add Party
  </button>

</div>

{/* ================= LIST ================= */}

<div className="flex-1 overflow-y-auto bg-slate-50">

  {/* CUSTOMERS */}

  <div className="p-4">

    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">

      Customers ({customers.length})

    </h3>

    <div className="space-y-3">

      {customers.map((party)=>(
        <PartyCard
          key={party._id}
          party={party}
          selected={
            selectedParty?._id===party._id
          }
          onClick={()=>
            setSelectedParty(party)
          }
        />
      ))}

    </div>

  </div>

  {/* SUPPLIERS */}

  <div className="border-t border-slate-200 p-4">

    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">

      Suppliers ({suppliers.length})

    </h3>

    <div className="space-y-3">

      {suppliers.map((party)=>(
        <PartyCard
          key={party._id}
          party={party}
          selected={
            selectedParty?._id===party._id
          }
          onClick={()=>
            setSelectedParty(party)
          }
        />
      ))}

    </div>

  </div>

  {/* COMPANY EXPENSE */}

  <div className="border-t border-slate-200 p-4">

    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">

      Company Expense ({expenses.length})

    </h3>

    <div className="space-y-3">

      {expenses.map((party)=>(
        <PartyCard
          key={party._id}
          party={party}
          selected={
            selectedParty?._id===party._id
          }
          onClick={()=>
            setSelectedParty(party)
          }
        />
      ))}

    </div>

  </div>

</div>
</div>

);

};

export default PartyList;