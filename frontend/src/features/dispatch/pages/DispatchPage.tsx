import { useEffect, useState } from "react";
import AdminLayout from "../../../app/layouts/AdminLayout";
import {
  getDispatches,
  createDispatch,
  updateDispatch,
} from "../services/dispatch.service";

import { getProductions } from "../../production/services/production.services";

const DispatchPage = () => {
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
    <AdminLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dispatch Management</h1>

        <p className="text-slate-500 mt-1">
          Track dispatches and delivery status
        </p>
      </div>

      <div className="mb-5">
        <input
          type="text"
          placeholder="🔍 Search product, destination, vehicle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl p-3"
        />
      </div>

      <div className="flex gap-3 mb-5">
        {["All", "Pending", "Dispatched", "Delivered"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl transition ${
              statusFilter === status ? "bg-blue-700 text-white" : "border"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-700 text-white px-5 py-2 rounded-xl"
        >
          + New Dispatch
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">{totalDispatches}</p>
          <p className="text-slate-500">Total Dispatches</p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">{pendingDispatches}</p>
          <p className="text-slate-500">Pending</p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">{dispatchedDispatches}</p>
          <p className="text-slate-500">Dispatched</p>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-3xl font-bold">{deliveredDispatches}</p>
          <p className="text-slate-500">Delivered</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border p-5">
            <p className="text-3xl font-bold">{totalUnits}</p>

            <p className="text-slate-500">Total Units Dispatched</p>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <p className="text-3xl font-bold">{todaysDispatches}</p>

            <p className="text-slate-500">Today's Dispatches</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-5">Dispatch Records</h2>

            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : filteredDispatches.length === 0 ? (
              <p className="text-slate-500">No dispatches found.</p>
            ) : (
              <div className="space-y-4">
                {filteredDispatches.map((dispatch: any) => (
                  <div
                    key={dispatch._id}
                    onClick={() => setSelectedDispatch(dispatch)}
                    className={`border rounded-xl p-4 cursor-pointer transition ${
                      selectedDispatch?._id === dispatch._id
                        ? "border-blue-600"
                        : "hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {dispatch.production?.finishedProduct?.name}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {dispatch.destination}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
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

                    <div className="flex justify-between mt-4 text-sm text-slate-500">
                      <span>{dispatch.quantity} units</span>

                      <span>
                        {new Date(dispatch.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
  onClick={(e) => {
  e.stopPropagation();
  handlePrint();
}}
  className="px-3 py-1 text-sm border rounded-lg hover:bg-slate-100"
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
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg"
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
        </div>

        <div className="col-span-5">
          <div className="bg-white rounded-xl border p-6">
            {!selectedDispatch ? (
              <div className="text-center text-slate-500 py-20">
                Select a dispatch
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">
                  {selectedDispatch.production?.finishedProduct?.name}
                </h2>

                <p className="text-slate-500 mb-6">
                  {selectedDispatch.destination}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-sm">Quantity</p>

                    <p className="font-semibold">{selectedDispatch.quantity}</p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-sm">Vehicle</p>

                    <p className="font-semibold">
                      {selectedDispatch.vehicleNumber || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-sm">Status</p>

                    <span
                      className={`inline-block px-3 py-1 rounded-full font-medium ${
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

                  <div>
                    <p className="text-slate-500 text-sm">Date</p>

                    <p className="font-semibold">
                      {new Date(
                        selectedDispatch.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedDispatch.notes && (
                  <div className="mt-6">
                    <p className="text-slate-500 text-sm">Notes</p>

                    <p className="mt-2">{selectedDispatch.notes}</p>
                  </div>
                )}

                <hr className="my-6" />

                <h3 className="font-semibold text-lg mb-4">
                  Dispatch Timeline
                </h3>

                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="w-3 h-3 rounded-full bg-blue-600 mt-2" />

                    <div>
                      <p className="font-medium">Dispatch Created</p>

                      <p className="text-sm text-slate-500">
                        {new Date(selectedDispatch.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        selectedDispatch.status === "Pending"
                          ? "bg-gray-300"
                          : "bg-orange-500"
                      }`}
                    />

                    <div>
                      <p className="font-medium">Dispatched</p>

                      <p className="text-sm text-slate-500">
                        {selectedDispatch.dispatchedAt
                          ? new Date(
                              selectedDispatch.dispatchedAt,
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
                          : "bg-gray-300"
                      }`}
                    />

                    <div>
                      <p className="font-medium">Delivered</p>

                      <p className="text-sm text-slate-500">
                        {selectedDispatch.status === "Delivered"
                          ? "Completed"
                          : "Waiting"}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedDispatch.status === "Dispatched" && (
                  <button
                    onClick={handleMarkDelivered}
                    className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl"
                  >
                    Mark as Delivered
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[600px]">
            <h2 className="text-xl font-semibold mb-5">Create Dispatch</h2>

            <div className="space-y-4">
              <select
                className="w-full border rounded-lg p-3"
                value={selectedProduction}
                onChange={(e) => setSelectedProduction(e.target.value)}
              >
                <option value="">Select Completed Production</option>

                {completedProductions.map((production: any) => (
                  <option key={production._id} value={production._id}>
                    {production.orderNumber} —{" "}
                    {production.finishedProduct?.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Dispatch Quantity"
                className="w-full border rounded-lg p-3"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />

              <input
                type="text"
                placeholder="Destination"
                className="w-full border rounded-lg p-3"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />

              <input
                type="text"
                placeholder="Vehicle Number"
                className="w-full border rounded-lg p-3"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
              />

              <textarea
                rows={3}
                placeholder="Notes"
                className="w-full border rounded-lg p-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateDispatch}
                className="px-5 py-2 bg-blue-700 text-white rounded-lg"
              >
                Create Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default DispatchPage;
