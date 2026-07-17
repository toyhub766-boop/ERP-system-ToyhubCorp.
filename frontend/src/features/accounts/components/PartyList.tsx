import { useState } from "react";
import PartyTabs from "./PartyTabs";
import PartyCard from "./PartyCard";

interface Props {
  parties: any[];
  selectedParty: any;
  setSelectedParty: (party: any) => void;
}

const PartyList = ({
    parties,
  selectedParty,
  setSelectedParty,
}: Props) => {
  const [activeTab, setActiveTab] = useState<
    "CUSTOMER" | "SUPPLIER"
  >("CUSTOMER");

  const [search, setSearch] = useState("");

  return (
    <div className="flex h-full flex-col">
      <PartyTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        search={search}
        setSearch={setSearch}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
  {parties.map((party: any) => (
    <PartyCard
      key={party._id}
      party={party}
      selected={selectedParty?._id === party._id}
      onClick={() => setSelectedParty(party)}
    />
  ))}
</div>
</div>
  );
};

export default PartyList;