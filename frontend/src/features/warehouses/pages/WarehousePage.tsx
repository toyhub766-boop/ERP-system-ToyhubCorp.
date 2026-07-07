import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../app/layouts/AdminLayout";

import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../services/warehouse.service";

type Warehouse = {
  _id: string;
  name: string;
  location: string;
  manager: string;
  status: string;
};

const WarehousePage = () => {
  const [warehouses, setwarehouses] = useState<Warehouse[]>([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null,
  );

  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
    manager: "",
    status: "ACTIVE",
  });

  const fetchwarehouses = async () => {
    try {
      const data = await getWarehouses();

      setwarehouses(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchwarehouses();
  }, []);

  const filteredwarehouses = useMemo(() => {
    return warehouses.filter(
      (Warehouse) =>
        Warehouse.name.toLowerCase().includes(search.toLowerCase()) ||
        Warehouse.location.toLowerCase().includes(search.toLowerCase()),
    );
  }, [warehouses, search]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Warehouse Management
          </h1>

          <p className="text-slate-500 mt-2">
            Manage product warehouses for inventory.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingWarehouse(null);

            setNewWarehouse({
              name: "",
              location: "",
              manager: "",
              status: "ACTIVE",
            });

            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-medium shadow-sm"
        >
          + Add Warehouse
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="bg-white border rounded-2xl p-5">
          <p className="text-slate-500 text-sm">Total warehouses</p>

          <h2 className="text-3xl font-bold mt-2">{warehouses.length}</h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p className="text-slate-500 text-sm">Active warehouses</p>

          <h2 className="text-3xl font-bold mt-2 text-green-600">
            {warehouses.filter((c) => c.status === "ACTIVE").length}
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border rounded-2xl p-5 mb-6">
        <input
          type="text"
          placeholder="Search Warehouse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-orange-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-4">Warehouse</th>

                <th className="text-left px-6 py-4">location</th>

                <th className="text-left px-6 py-4">Manager </th>

                <th className="text-left px-6 py-4">Status</th>

                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredwarehouses.map((Warehouse) => (
                <tr key={Warehouse._id} className="border-t hover:bg-slate-50">
                  <td className="px-6 py-5 font-medium">{Warehouse.name}</td>

                  <td className="px-6 py-5">{Warehouse.location}</td>

<td className="px-6 py-5">{Warehouse.manager}</td>
                  <td className="px-6 py-5">
                    

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        Warehouse.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {Warehouse.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-3">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setEditingWarehouse(Warehouse);

                          setNewWarehouse({
                            name: Warehouse.name,
                            location: Warehouse.location,
                            manager: Warehouse.manager,
                            status: Warehouse.status,
                          });

                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={async () => {
                          if (window.confirm(`Delete ${Warehouse.name}?`)) {
                            try {
                              await deleteWarehouse(Warehouse._id);

                              fetchwarehouses();
                            } catch (error) {
                              console.log(error);
                            }
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
              </h2>

              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Warehouse Name"
                value={newWarehouse.name}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    name: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <input 
              type="text"
                placeholder="location"
                value={newWarehouse.location}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    location: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                type="text"
                placeholder="Manager"
                value={newWarehouse.manager}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    manager: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <select
                value={newWarehouse.status}
                onChange={(e) =>
                  setNewWarehouse({
                    ...newWarehouse,
                    status: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="ACTIVE">ACTIVE</option>

                <option value="INACTIVE">INACTIVE</option>
              </select>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 border rounded-xl"
                >
                  Cancel
                </button>

                <button
                  className="px-5 py-3 bg-orange-500 text-white rounded-xl"
                  onClick={async () => {
                    try {
                      if (editingWarehouse) {
                        await updateWarehouse(
                          editingWarehouse._id,
                          newWarehouse,
                        );
                      } else {
                        await createWarehouse(newWarehouse);
                      }

                      await fetchwarehouses();

                      setShowModal(false);

                      setEditingWarehouse(null);

                      setNewWarehouse({
                        name: "",
                        location: "",
                        manager: "",
                        status: "ACTIVE",
                      });
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                >
                  {editingWarehouse ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default WarehousePage;
