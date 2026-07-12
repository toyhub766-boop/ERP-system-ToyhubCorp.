import { useEffect, useState } from "react";
import {
  getDispatches,
  createDispatch,
  updateDispatch,
} from "../../dispatch/services/dispatch.service";

import { getProductions } from "../../production/services/production.services";

const ProductionStaffDispatchPage = () => {
  const [dispatches, setDispatches] = useState<any[]>([]);

  const [selectedDispatch, setSelectedDispatch] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [completedProductions, setCompletedProductions] = useState<any[]>([]);

  const [selectedProduction, setSelectedProduction] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [destination, setDestination] = useState("");

  const [vehicleNumber, setVehicleNumber] = useState("");

  const [notes, setNotes] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const loadDispatches = async () => {
    try {
      setLoading(true);

      const [dispatchData, productionData] = await Promise.all([
        getDispatches(),
        getProductions(),
      ]);

      console.log(productionData);

      setDispatches(dispatchData);

      setCompletedProductions(
        productionData.filter((p: any) => p.status === "Completed"),
      );

      if (dispatchData.length > 0) {
        setSelectedDispatch(dispatchData[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatches();
  }, []);

  const handleCreateDispatch = async () => {
    if (!selectedProduction) {
      alert("Select a production order");
      return;
    }

    if (!destination) {
      alert("Enter destination");
      return;
    }

    try {
      await createDispatch({
        production: selectedProduction,
        quantity,
        destination,
        vehicleNumber,
        notes,
      });

      setShowModal(false);

      setSelectedProduction("");
      setQuantity(1);
      setDestination("");
      setVehicleNumber("");
      setNotes("");

      loadDispatches();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkDelivered = async () => {
    if (!selectedDispatch) return;

    try {
      await updateDispatch(selectedDispatch._id, {
        ...selectedDispatch,
        status: "Delivered",
      });

      await loadDispatches();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrint = () => {

  if (!selectedDispatch) return;

  const printWindow = window.open("", "_blank");

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Dispatch Challan</title>

        <style>

          body{
            font-family:Arial;
            padding:40px;
            line-height:1.8;
          }

          h1{
            text-align:center;
            margin-bottom:10px;
          }

          hr{
            margin:20px 0;
          }

          table{
            width:100%;
            border-collapse:collapse;
          }

          td{
            padding:10px;
            border:1px solid #ddd;
          }

          .signatures{
            display:flex;
            justify-content:space-between;
            margin-top:80px;
          }

        </style>

      </head>

      <body>

        <h1>Toy Hub Corporation</h1>

        <p style="text-align:center">
          Dispatch Challan
        </p>

        <hr>

        <table>

          <tr>
            <td><b>Product</b></td>
            <td>${selectedDispatch.production?.finishedProduct?.name}</td>
          </tr>

          <tr>
            <td><b>Quantity</b></td>
            <td>${selectedDispatch.quantity}</td>
          </tr>

          <tr>
            <td><b>Destination</b></td>
            <td>${selectedDispatch.destination}</td>
          </tr>

          <tr>
            <td><b>Vehicle</b></td>
            <td>${selectedDispatch.vehicleNumber || "-"}</td>
          </tr>

          <tr>
            <td><b>Status</b></td>
            <td>${selectedDispatch.status}</td>
          </tr>

          <tr>
            <td><b>Date</b></td>
            <td>${new Date(
              selectedDispatch.createdAt
            ).toLocaleDateString()}</td>
          </tr>

        </table>

        <div class="signatures">

          <div>

            ______________________

            <br>

            Authorized Signature

          </div>

          <div>

            ______________________

            <br>

            Receiver Signature

          </div>

        </div>

      </body>

    </html>
  `);

  printWindow.document.close();

  printWindow.print();

};

  const filteredDispatches = dispatches.filter((dispatch: any) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      dispatch.production?.finishedProduct?.name
        ?.toLowerCase()
        .includes(keyword) ||
      dispatch.destination?.toLowerCase().includes(keyword) ||
      dispatch.vehicleNumber?.toLowerCase().includes(keyword) ||
      dispatch.status?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "All" || dispatch.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalDispatches = dispatches.length;

  const pendingDispatches = dispatches.filter(
    (d: any) => d.status === "Pending",
  ).length;

  const dispatchedDispatches = dispatches.filter(
    (d: any) => d.status === "Dispatched",
  ).length;

  const deliveredDispatches = dispatches.filter(
    (d: any) => d.status === "Delivered",
  ).length;

  const totalUnits = dispatches.reduce(
    (sum: number, d: any) => sum + d.quantity,
    0,
  );

  const todaysDispatches = dispatches.filter((d: any) => {
    return new Date(d.createdAt).toDateString() === new Date().toDateString();
  }).length;

return (
  <>
    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

        <div>

          <p className="text-sm text-slate-500">
            Admin / Dispatch
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            Dispatch Management
          </h1>

          <p className="text-slate-500 mt-2">
            Track dispatches, deliveries and shipment progress.
          </p>

        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
            bg-[#17357A]
            hover:bg-[#10295F]
            text-white
            px-6
            py-3
            rounded-xl
            font-medium
            transition
          "
        >
          + New Dispatch
        </button>

      </div>

      {/* Search + Filter */}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

        <div className="flex flex-col lg:flex-row gap-4">

          <input
            type="text"
            placeholder="Search product, destination or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              flex-1
              rounded-xl
              border
              border-slate-300
              px-4
              py-3
              focus:outline-none
              focus:ring-2
              focus:ring-[#17357A]
            "
          />

          <div className="flex flex-wrap gap-2">

            {["All", "Pending", "Dispatched", "Delivered"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-5 py-2 rounded-xl transition ${
                    statusFilter === status
                      ? "bg-[#17357A] text-white"
                      : "border border-slate-300 bg-white hover:bg-slate-50"
                  }`}
                >
                  {status}
                </button>
              )
            )}

          </div>

        </div>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-5">

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">
            Total Dispatches
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalDispatches}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">
            Pending
          </p>

          <h2 className="text-3xl font-bold text-yellow-600 mt-2">
            {pendingDispatches}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">
            Dispatched
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {dispatchedDispatches}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">
            Delivered
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {deliveredDispatches}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">
            Units
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {totalUnits}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-sm text-slate-500">
            Today
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {todaysDispatches}
          </h2>
        </div>

      </div>

      {/* Main Content */}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        <div className="xl:col-span-7">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <h2 className="text-xl font-semibold mb-6">
              Dispatch Records
            </h2>
            
            {loading ? (

  <div className="py-16 text-center text-slate-500">
    Loading dispatches...
  </div>

) : filteredDispatches.length === 0 ? (

  <div className="py-16 text-center text-slate-500">
    No dispatches found.
  </div>

) : (

  <div className="space-y-4">

    {filteredDispatches.map((dispatch: any) => (

      <div
        key={dispatch._id}
        onClick={() => setSelectedDispatch(dispatch)}
        className={`rounded-2xl border p-5 cursor-pointer transition-all ${
          selectedDispatch?._id === dispatch._id
            ? "border-[#17357A] bg-blue-50"
            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
        }`}
      >

        <div className="flex items-start justify-between gap-4">

          <div>

            <h3 className="text-lg font-semibold text-slate-900">
              {dispatch.production?.finishedProduct?.name}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {dispatch.destination}
            </p>

          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              dispatch.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : dispatch.status === "Dispatched"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {dispatch.status}
          </span>

        </div>

        <div className="grid grid-cols-2 gap-4 mt-5 text-sm">

          <div>

            <p className="text-slate-500">
              Quantity
            </p>

            <p className="font-semibold mt-1">
              {dispatch.quantity} units
            </p>

          </div>

          <div>

            <p className="text-slate-500">
              Date
            </p>

            <p className="font-semibold mt-1">
              {new Date(dispatch.createdAt).toLocaleDateString()}
            </p>

          </div>

        </div>

        <div className="flex gap-3 mt-5">

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrint();
            }}
            className="
              rounded-xl
              border
              border-slate-300
              px-4
              py-2
              text-sm
              hover:bg-slate-50
              transition
            "
          >
            🖨 Print
          </button>

          {dispatch.status === "Dispatched" && (

            <button
              onClick={async (e) => {
                e.stopPropagation();

                try {
                  await updateDispatch(dispatch._id, {
                    ...dispatch,
                    status: "Delivered",
                  });

                  await loadDispatches();
                } catch (error) {
                  console.error(error);
                }
              }}
              className="
                rounded-xl
                bg-green-600
                hover:bg-green-700
                text-white
                px-4
                py-2
                text-sm
                transition
              "
            >
              🚚 Deliver
            </button>

          )}

        </div>

      </div>

    ))}

  </div>

)}

        </div>

        <div className="xl:col-span-5">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {!selectedDispatch ? (

  <div className="py-24 text-center text-slate-500">
    Select a dispatch record to view details.
  </div>

) : (

  <>

    <div className="flex items-start justify-between">

      <div>

        <h2 className="text-2xl font-bold">
          {selectedDispatch.production?.finishedProduct?.name}
        </h2>

        <p className="text-slate-500 mt-1">
          {selectedDispatch.destination}
        </p>

      </div>

      <span
        className={`px-4 py-2 rounded-full text-sm font-semibold ${
          selectedDispatch.status === "Pending"
            ? "bg-yellow-100 text-yellow-700"
            : selectedDispatch.status === "Dispatched"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {selectedDispatch.status}
      </span>

    </div>

    {/* Summary */}

    <div className="grid grid-cols-2 gap-4 mt-8">

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <p className="text-sm text-slate-500">
          Quantity
        </p>

        <h3 className="font-semibold text-lg mt-1">
          {selectedDispatch.quantity}
        </h3>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <p className="text-sm text-slate-500">
          Vehicle
        </p>

        <h3 className="font-semibold text-lg mt-1">
          {selectedDispatch.vehicleNumber || "-"}
        </h3>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <p className="text-sm text-slate-500">
          Dispatch Date
        </p>

        <h3 className="font-semibold mt-1">
          {new Date(
            selectedDispatch.createdAt
          ).toLocaleDateString()}
        </h3>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <p className="text-sm text-slate-500">
          Destination
        </p>

        <h3 className="font-semibold mt-1">
          {selectedDispatch.destination}
        </h3>
      </div>

    </div>

    {/* Notes */}

    {selectedDispatch.notes && (

      <div className="mt-8">

        <h3 className="font-semibold mb-2">
          Notes
        </h3>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
          {selectedDispatch.notes}
        </div>

      </div>

    )}

    {/* Timeline */}

    <div className="mt-8">

      <h3 className="font-semibold text-lg mb-5">
        Dispatch Timeline
      </h3>

      <div className="space-y-6">

        <div className="flex gap-4">

          <div className="w-3 h-3 rounded-full bg-blue-600 mt-2" />

          <div>

            <p className="font-medium">
              Dispatch Created
            </p>

            <p className="text-sm text-slate-500">
              {new Date(
                selectedDispatch.createdAt
              ).toLocaleString()}
            </p>

          </div>

        </div>

        <div className="flex gap-4">

          <div
            className={`w-3 h-3 rounded-full mt-2 ${
              selectedDispatch.status === "Pending"
                ? "bg-slate-300"
                : "bg-orange-500"
            }`}
          />

          <div>

            <p className="font-medium">
              Dispatched
            </p>

            <p className="text-sm text-slate-500">
              {selectedDispatch.dispatchedAt
                ? new Date(
                    selectedDispatch.dispatchedAt
                  ).toLocaleString()
                : "Waiting"}
            </p>

          </div>

        </div>

        <div className="flex gap-4">

          <div
            className={`w-3 h-3 rounded-full mt-2 ${
              selectedDispatch.status === "Delivered"
                ? "bg-green-600"
                : "bg-slate-300"
            }`}
          />

          <div>

            <p className="font-medium">
              Delivered
            </p>

            <p className="text-sm text-slate-500">
              {selectedDispatch.status === "Delivered"
                ? "Completed"
                : "Waiting"}
            </p>

          </div>

        </div>

      </div>

    </div>

    {selectedDispatch.status === "Dispatched" && (

      <button
        onClick={handleMarkDelivered}
        className="
          w-full
          mt-8
          rounded-xl
          bg-green-600
          py-3
          font-medium
          text-white
          transition
          hover:bg-green-700
        "
      >
        Mark as Delivered
      </button>

    )}

  </>

)}

      </div>

    </div>

          {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* Header */}

            <div className="border-b border-slate-200 px-8 py-6">

              <h2 className="text-2xl font-bold">
                Create Dispatch
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Schedule a new dispatch from completed production.
              </p>

            </div>

            {/* Body */}

            <div className="space-y-6 p-8">

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Completed Production
                </label>

                <select
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:border-[#17357A]
                  "
                  value={selectedProduction}
                  onChange={(e) => setSelectedProduction(e.target.value)}
                >
                  <option value="">
                    Select Completed Production
                  </option>

                  {completedProductions.map((production: any) => (

                    <option
                      key={production._id}
                      value={production._id}
                    >
                      {production.orderNumber} —{" "}
                      {production.finishedProduct?.name}
                    </option>

                  ))}

                </select>

              </div>

              <div className="grid grid-cols-2 gap-5">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Dispatch Quantity
                  </label>

                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Number(e.target.value))
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-3
                      outline-none
                      transition
                      focus:border-[#17357A]
                    "
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Vehicle Number
                  </label>

                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) =>
                      setVehicleNumber(e.target.value)
                    }
                    placeholder="MH12 AB1234"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-300
                      px-4
                      py-3
                      outline-none
                      transition
                      focus:border-[#17357A]
                    "
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Destination
                </label>

                <input
                  type="text"
                  value={destination}
                  onChange={(e) =>
                    setDestination(e.target.value)
                  }
                  placeholder="Customer / Warehouse"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:border-[#17357A]
                  "
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Notes
                </label>

                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Additional dispatch notes..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-300
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:border-[#17357A]
                  "
                />

              </div>

            </div>

            {/* Footer */}

            <div className="flex justify-end gap-3 border-t border-slate-200 px-8 py-6">

              <button
                onClick={() => setShowModal(false)}
                className="
                  rounded-xl
                  border
                  border-slate-300
                  px-6
                  py-3
                  font-medium
                  transition
                  hover:bg-slate-100
                "
              >
                Cancel
              </button>

              <button
                onClick={handleCreateDispatch}
                className="
                  rounded-xl
                  bg-[#17357A]
                  px-6
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#10295F]
                "
              >
                Create Dispatch
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
    </div>
    </div>

  </>
);
            };

export default ProductionStaffDispatchPage;
