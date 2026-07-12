import { useEffect, useState } from "react";
import { getBOMs } from "../../bom/services/bom.service";
import {
  getProductions,
  calculateProduction,
  createProduction,
  updateProduction,
  getMaterialConsumption,
} from "../../production/services/production.services";

const ProductionStaffProductionPage = () => {
  const [productions, setProductions] = useState<any[]>([]);

  const [selectedProduction, setSelectedProduction] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const [availability, setAvailability] = useState<any>(null);

  const [materialConsumption, setMaterialConsumption] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [boms, setBoms] = useState<any[]>([]);

  const [selectedBOM, setSelectedBOM] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [team, setTeam] = useState("");

  const [targetDate, setTargetDate] = useState("");

  const [notes, setNotes] = useState("");

  const [activeTab, setActiveTab] = useState<"orders" | "calculator">("orders");

  const [calculatorBOM, setCalculatorBOM] = useState("");

  const [calculatorQuantity, setCalculatorQuantity] = useState(1);

  const [calculatorResult, setCalculatorResult] = useState<any>(null);

  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const [actualQuantity, setActualQuantity] = useState(0);

  const [completionRemarks, setCompletionRemarks] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [productionData, bomData] = await Promise.all([
        getProductions(),
        getBOMs(),
      ]);

      setProductions(productionData);
      setBoms(bomData);

      if (productionData.length > 0) {
        setSelectedProduction(productionData[0]);
        await loadAvailability(productionData[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async (production: any) => {
    try {
      const result = await calculateProduction({
        bom: production.bom._id,
        quantity: production.quantity,
      });

      setAvailability(result);
      const consumption = await getMaterialConsumption(production._id);

      setMaterialConsumption(consumption);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduction = async () => {
    if (!selectedBOM) {
      alert("Select a BOM");
      return;
    }

    if (quantity <= 0) {
      alert("Enter valid quantity");
      return;
    }

    try {
      await createProduction({
        bom: selectedBOM,

        quantity,

        team,

        targetDate,

        notes,
      });

      setShowModal(false);

      setSelectedBOM("");

      setQuantity(1);

      setTeam("");

      setTargetDate("");

      setNotes("");

      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedProduction) return;

    try {
      await updateProduction(selectedProduction._id, {
        ...selectedProduction,
        status,
        bom: selectedProduction.bom._id,
      });

      const productionData = await getProductions();

      setProductions(productionData);

      const updated = productionData.find(
        (p: any) => p._id === selectedProduction._id,
      );

      if (updated) {
        setSelectedProduction(updated);
        await loadAvailability(updated);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCalculate = async () => {
    try {
      const result = await calculateProduction({
        bom: calculatorBOM,
        quantity: calculatorQuantity,
      });

      setCalculatorResult(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteProduction = async () => {
    if (!selectedProduction) return;

    if (actualQuantity <= 0) {
      alert("Enter actual produced quantity");
      return;
    }

    try {
      await updateProduction(selectedProduction._id, {
        ...selectedProduction,
        bom: selectedProduction.bom._id,
        status: "Completed",
        actualQuantity,
        completedAt: new Date().toISOString(),
        remarks: completionRemarks,
      });

      setShowCompletionModal(false);

      setActualQuantity(0);

      setCompletionRemarks("");

      const productionData = await getProductions();

      setProductions(productionData);

      const updated = productionData.find(
        (p: any) => p._id === selectedProduction._id,
      );

      if (updated) {
        setSelectedProduction(updated);
        await loadAvailability(updated);
      }
    } catch (error) {
      console.error(error);
    }
  };

 return (
  <>
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Header */}

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              Production Management
            </h1>

            <p className="text-slate-500 mt-1">
              Production orders, batch tracking and capacity planning
            </p>

          </div>

          <button
            onClick={() => setShowModal(true)}
            className="
              px-5
              py-3
              rounded-xl
              bg-[#17357A]
              text-white
              font-medium
              hover:bg-[#20459a]
              transition
            "
          >
            + New Order
          </button>

        </div>

        {/* Tabs */}

        <div className="flex gap-3">

          <button
            onClick={() => setActiveTab("orders")}
            className={`
              px-5
              py-2.5
              rounded-xl
              font-medium
              transition
              ${
                activeTab === "orders"
                  ? "bg-[#17357A] text-white"
                  : "bg-white border border-slate-200 hover:bg-slate-50"
              }
            `}
          >
            📦 Production Orders
          </button>

          <button
            onClick={() => setActiveTab("calculator")}
            className={`
              px-5
              py-2.5
              rounded-xl
              font-medium
              transition
              ${
                activeTab === "calculator"
                  ? "bg-[#17357A] text-white"
                  : "bg-white border border-slate-200 hover:bg-slate-50"
              }
            `}
          >
            🧮 Capacity Calculator
          </button>

        </div>

        {/* Stats */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Total Orders
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {productions.length}
            </h2>

          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Active Orders
            </p>

            <h2 className="text-3xl font-bold text-blue-700 mt-2">
              {
                productions.filter(
                  (p) => p.status === "In Progress"
                ).length
              }
            </h2>

          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Completed
            </p>

            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {
                productions.filter(
                  (p) => p.status === "Completed"
                ).length
              }
            </h2>

          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Draft Orders
            </p>

            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {
                productions.filter(
                  (p) => p.status === "Draft"
                ).length
              }
            </h2>

          </div>

        </div>

        {activeTab === "orders" ? (

          <div className="grid xl:grid-cols-5 gap-6">

            {/* Orders */}

            <div className="xl:col-span-3">

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                <div className="flex items-center justify-between mb-6">

                  <h2 className="text-xl font-semibold">
                    Production Orders
                  </h2>

                  <span className="text-sm text-slate-500">
                    {productions.length} Orders
                  </span>

                </div>

                <div className="space-y-4">


{loading ? (
  <p className="text-slate-500">
    Loading...
  </p>
) : productions.length === 0 ? (
  <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
    No production orders found.
  </div>
) : (
  productions.map((production) => (
    <div
      key={production._id}
      onClick={() => {
        setSelectedProduction(production);
        loadAvailability(production);
      }}
      className={`
        rounded-2xl
        border
        p-5
        cursor-pointer
        transition-all
        ${
          selectedProduction?._id === production._id
            ? "border-[#17357A] bg-blue-50"
            : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
        }
      `}
    >
      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-[#17357A]">
            {production.orderNumber}
          </p>

          <h3 className="text-lg font-semibold mt-1">
            {production.finishedProduct?.name}
          </h3>

        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
          {production.status}
        </span>

      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">

        <div>

          <p className="text-slate-500">
            Quantity
          </p>

          <p className="font-semibold mt-1">
            {production.quantity} units
          </p>

        </div>

        <div>

          <p className="text-slate-500">
            Team
          </p>

          <p className="font-semibold mt-1">
            {production.team}
          </p>

        </div>

      </div>

      <div className="mt-4 border-t pt-4 text-sm text-slate-500">

        Target:
        {" "}
        {new Date(
          production.targetDate
        ).toLocaleDateString()}

      </div>

    </div>
  ))
)}

                </div>

              </div>

            </div>

            {/* Details */}

            <div className="xl:col-span-2">

              <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                {!selectedProduction ? (

                  <div className="py-20 text-center text-slate-500">
                    Select a production order
                  </div>

                ) : (

                  <>

                    <div className="flex items-start justify-between">

                      <div>

                        <h2 className="text-2xl font-bold">
                          {selectedProduction.finishedProduct?.name}
                        </h2>

                        <p className="text-slate-500 mt-1">
                          {selectedProduction.orderNumber}
                        </p>

                      </div>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {selectedProduction.status}
                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-5 mt-8">

                      <div>

                        <p className="text-sm text-slate-500">
                          Quantity
                        </p>

                        <p className="font-semibold mt-1">
                          {selectedProduction.quantity}
                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-slate-500">
                          Team
                        </p>

                        <p className="font-semibold mt-1">
                          {selectedProduction.team}
                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-slate-500">
                          Status
                        </p>

                        <p className="font-semibold mt-1">
                          {selectedProduction.status}
                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-slate-500">
                          Target Date
                        </p>

                        <p className="font-semibold mt-1">
                          {new Date(
                            selectedProduction.targetDate
                          ).toLocaleDateString()}
                        </p>

                      </div>

                    </div>

                    {selectedProduction.notes && (

                      <div className="mt-8 rounded-xl bg-slate-50 p-4">

                        <p className="text-sm font-medium text-slate-500">
                          Notes
                        </p>

                        <p className="mt-2">
                          {selectedProduction.notes}
                        </p>

                      </div>

                    )}

                    {selectedProduction.status === "Completed" && (

                      <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">

                        <h3 className="font-semibold mb-4">
                          Production Entry
                        </h3>

                        <div className="grid grid-cols-2 gap-4">

                          <div>

                            <p className="text-sm text-slate-500">
                              Actual Quantity
                            </p>

                            <p className="font-semibold mt-1">
                              {selectedProduction.actualQuantity}
                            </p>

                          </div>

                          <div>

                            <p className="text-sm text-slate-500">
                              Completed On
                            </p>

                            <p className="font-semibold mt-1">
                              {selectedProduction.completedAt
                                ? new Date(
                                    selectedProduction.completedAt
                                  ).toLocaleDateString()
                                : "-"}
                            </p>

                          </div>

                        </div>

                        {selectedProduction.remarks && (

                          <div className="mt-4">

                            <p className="text-sm text-slate-500">
                              Remarks
                            </p>

                            <p className="mt-1">
                              {selectedProduction.remarks}
                            </p>

                          </div>

                        )}

                      </div>

                    )}

                    {materialConsumption.length > 0 && (

                      <div className="mt-8 rounded-2xl border border-slate-200 p-5">

                        <h3 className="text-lg font-semibold mb-5">
                          Material Consumption
                        </h3>

                        <div className="space-y-3">

                          {materialConsumption.map((item: any) => (

                            <div
                              key={item._id}
                              className="flex items-center justify-between border-b border-slate-100 pb-3"
                            >

                              <div>

                                <p className="font-medium">
                                  {item.material?.name}
                                </p>

                                <p className="text-sm text-slate-500">
                                  {item.material?.unit || ""}
                                </p>

                              </div>

                              <p className="font-semibold">
                                {item.requiredQuantity}
                              </p>

                            </div>

                          ))}

                        </div>

                      </div>

                    )}
                    
                    
                    
                                      <div className="mt-8">

                      {selectedProduction.status === "Draft" && (

                        <button
                          onClick={() => handleStatusUpdate("Approved")}
                          className="w-full rounded-xl bg-[#17357A] py-3 font-medium text-white transition hover:bg-[#20459a]"
                        >
                          Approve Order
                        </button>

                      )}

                      {selectedProduction.status === "Approved" && (

                        <button
                          onClick={() => handleStatusUpdate("Started")}
                          className="w-full rounded-xl bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-700"
                        >
                          Start Production
                        </button>

                      )}

                      {selectedProduction.status === "Started" && (

                        <button
                          onClick={() =>
                            handleStatusUpdate("In Progress")
                          }
                          className="w-full rounded-xl bg-orange-500 py-3 font-medium text-white transition hover:bg-orange-600"
                        >
                          Mark In Progress
                        </button>

                      )}

                      {selectedProduction.status === "In Progress" && (

                        <button
                          onClick={() => {
                            console.log("Complete clicked");
                            setShowCompletionModal(true);
                          }}
                          className="w-full rounded-xl bg-green-600 py-3 font-medium text-white transition hover:bg-green-700"
                        >
                          Complete Production
                        </button>

                      )}

                      {selectedProduction.status !== "Completed" &&
                        selectedProduction.status !== "Cancelled" && (

                          <button
                            onClick={() =>
                              handleStatusUpdate("Cancelled")
                            }
                            className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 py-3 font-medium text-red-600 transition hover:bg-red-100"
                          >
                            Cancel Order
                          </button>

                        )}

                    </div>

                    <div className="my-8 border-t border-slate-200" />

                    <h3 className="mb-5 text-lg font-semibold">
                      Material Availability
                    </h3>

                    {availability && (

                      <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">

                        <p className="text-sm text-slate-500">
                          Maximum Producible
                        </p>

                        <h2 className="mt-2 text-5xl font-bold">
                          {availability.maximumProducible}
                        </h2>

                        <p className="mt-3 text-sm font-medium text-red-600">
                          Bottleneck: {availability.bottleneck}
                        </p>

                      </div>

                    )}

                    <div className="space-y-3">

                      {availability?.materials?.map((item: any) => (

                        <div
                          key={item.product}
                          className={`rounded-2xl border p-5 ${
                            item.sufficient
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >

                          <div className="flex items-center justify-between">

                            <h4 className="font-semibold">
                              {item.product}
                            </h4>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.sufficient
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.sufficient
                                ? "Available"
                                : "Short"}
                            </span>

                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">

                            <div>

                              <p className="text-slate-500">
                                Required
                              </p>

                              <p className="mt-1 font-semibold">
                                {item.required}
                              </p>

                            </div>

                            <div>

                              <p className="text-slate-500">
                                Available
                              </p>

                              <p className="mt-1 font-semibold">
                                {item.available}
                              </p>

                            </div>

                          </div>

                          {!item.sufficient && (

                            <div className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">

                              Shortage: {item.shortage}

                            </div>

                          )}

                        </div>

                      ))}

                    </div>

                  </>

                )}

              </div>

            </div>

          </div>

        ) : (

          <div className="max-w-4xl">

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

              <h2 className="text-2xl font-semibold">
                Material Capacity Calculator
              </h2>

              <p className="mt-1 text-slate-500">
                Calculate production feasibility based on current inventory.
              </p>

              <div className="mt-8 space-y-5">

                <select
                  className="w-full rounded-xl border border-slate-300 p-3"
                  value={calculatorBOM}
                  onChange={(e) =>
                    setCalculatorBOM(e.target.value)
                  }
                >
                  <option value="">
                    Select BOM
                  </option>

                  {boms.map((bom: any) => (

                    <option
                      key={bom._id}
                      value={bom._id}
                    >
                      {bom.finishedProduct?.name}
                    </option>

                  ))}

                </select>

                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-300 p-3"
                  placeholder="Production Quantity"
                  value={calculatorQuantity}
                  onChange={(e) =>
                    setCalculatorQuantity(
                      Number(e.target.value)
                    )
                  }
                />

                <button
                  onClick={handleCalculate}
                  className="w-full rounded-xl bg-[#17357A] py-3 font-medium text-white transition hover:bg-[#20459a]"
                >
                  Calculate Production Capacity
                </button>

              </div>

            </div>

            {calculatorResult && (

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center">

                  <p className="text-sm text-slate-500">
                    Maximum Producible Quantity
                  </p>

                  <h1 className="mt-3 text-6xl font-bold">

                    {calculatorResult.maximumProducible}

                  </h1>

                  <p className="mt-3 text-slate-600">

                    units of{" "}

                    <span className="font-semibold">

                      {
                        boms.find(
                          (b: any) =>
                            b._id === calculatorBOM
                        )?.finishedProduct?.name
                      }

                    </span>

                  </p>

                  <p className="mt-4 font-medium text-red-600">

                    Bottleneck: {calculatorResult.bottleneck}

                  </p>

                </div>

                <h3 className="mt-8 mb-5 text-xl font-semibold">

                  Material Breakdown

                </h3>

                <div className="space-y-3">

                  {calculatorResult.materials.map((item: any) => (
                                  <div
                    key={item.product}
                    className={`rounded-2xl border p-5 ${
                      item.sufficient
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <h4 className="font-semibold">
                        {item.product}
                      </h4>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.sufficient
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.sufficient ? "Available" : "Short"}
                      </span>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">

                      <div>

                        <p className="text-slate-500">
                          Required
                        </p>

                        <p className="mt-1 font-semibold">
                          {item.required}
                        </p>

                      </div>

                      <div>

                        <p className="text-slate-500">
                          Available
                        </p>

                        <p className="mt-1 font-semibold">
                          {item.available}
                        </p>

                      </div>

                    </div>

                    {!item.sufficient && (

                      <div className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">

                        Shortage: {item.shortage}

                      </div>

                    )}

                  </div>

                  ))}

                </div>

              </div>

            )}

          </div>

        )}

        {/* Create Production Modal */}

        {showModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">

              <div className="border-b border-slate-200 px-8 py-6">

                <h2 className="text-2xl font-bold">
                  Create Production Order
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Schedule a new production order.
                </p>

              </div>

              <div className="grid grid-cols-2 gap-5 p-8">

                <div className="col-span-2">

                  <label className="mb-2 block text-sm font-medium">
                    BOM
                  </label>

                  <select
                    className="w-full rounded-xl border border-slate-300 p-3"
                    value={selectedBOM}
                    onChange={(e) =>
                      setSelectedBOM(e.target.value)
                    }
                  >
                    <option value="">
                      Select BOM
                    </option>

                    {boms.map((bom) => (

                      <option
                        key={bom._id}
                        value={bom._id}
                      >
                        {bom.finishedProduct?.name}
                      </option>

                    ))}

                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Quantity
                  </label>

                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-300 p-3"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Number(e.target.value))
                    }
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Team
                  </label>

                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 p-3"
                    value={team}
                    onChange={(e) =>
                      setTeam(e.target.value)
                    }
                  />

                </div>

                <div className="col-span-2">

                  <label className="mb-2 block text-sm font-medium">
                    Target Date
                  </label>

                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-300 p-3"
                    value={targetDate}
                    onChange={(e) =>
                      setTargetDate(e.target.value)
                    }
                  />

                </div>

                <div className="col-span-2">

                  <label className="mb-2 block text-sm font-medium">
                    Notes
                  </label>

                  <textarea
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-300 p-3"
                    value={notes}
                    onChange={(e) =>
                      setNotes(e.target.value)
                    }
                  />

                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-8 py-6">

                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-300 px-6 py-3 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateProduction}
                  className="rounded-xl bg-[#17357A] px-6 py-3 font-medium text-white hover:bg-[#20459a]"
                >
                  Create Order
                </button>

              </div>

            </div>

          </div>

        )}

        {/* Completion Modal */}

        {showCompletionModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

            <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">

              <div className="border-b border-slate-200 px-8 py-6">

                <h2 className="text-2xl font-bold">
                  Complete Production
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Record the final production quantity.
                </p>

              </div>

              <div className="space-y-5 p-8">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Actual Produced Quantity
                  </label>

                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-300 p-3"
                    value={actualQuantity}
                    onChange={(e) =>
                      setActualQuantity(Number(e.target.value))
                    }
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Remarks
                  </label>

                  <textarea
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-300 p-3"
                    value={completionRemarks}
                    onChange={(e) =>
                      setCompletionRemarks(e.target.value)
                    }
                  />

                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-8 py-6">

                <button
                  onClick={() =>
                    setShowCompletionModal(false)
                  }
                  className="rounded-xl border border-slate-300 px-6 py-3 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCompleteProduction}
                  className="rounded-xl bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                >
                  Complete Production
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  </>
);  
                };

export default ProductionStaffProductionPage;
