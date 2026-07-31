import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../app/layouts/AdminLayout";

import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../services/warehouse.service";
import PageContainer from "../../../components/ui/PageContainer";
import SectionCard from "../../../components/ui/SectionCard";
import PageHeader from "../../../components/ui/PageHeader";
import StatCard from "../../../components/ui/StatCard";
import { getUsers } from "../../users/services/user.service";

type Warehouse = {
  _id: string;
  name: string;
  location: string;

  managers: {
  _id: string;
  name: string;
}[];

  status: string;
};

const WarehousePage = () => {
  const [warehouses, setwarehouses] = useState<Warehouse[]>([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null,
  );
const [inventoryUsers, setInventoryUsers] =
  useState<any[]>([]);

  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
    managers: [] as string[],
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

  const fetchInventoryUsers = async () => {

  const users = await getUsers();

  setInventoryUsers(

    users.filter(
      (user: any) =>
        user.role === "INVENTORY"
    )

  );

};

  useEffect(() => {
fetchwarehouses();
fetchInventoryUsers();
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
    <PageContainer className="space-y-6">

      <PageHeader
        title="Warehouse Management"
        subtitle="Manage warehouse locations, managers and inventory distribution."
        action={
          <button
            onClick={() => {
              setEditingWarehouse(null);

              setNewWarehouse({
                name: "",
                location: "",
                managers: [] as string[],
                status: "ACTIVE",
              });

              setShowModal(true);
            }}
            className="
              rounded-xl
              bg-[#172B6B]
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#20398F]
            "
          >
            + Add Warehouse
          </button>
        }
      />

      {/* Stats */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard
          title="Total Warehouses"
          value={warehouses.length}
        />

        <StatCard
          title="Active"
          value={
            warehouses.filter((w) => w.status === "ACTIVE").length
          }
        />

        <StatCard
          title="Inactive"
          value={
            warehouses.filter((w) => w.status === "INACTIVE").length
          }
        />

        <StatCard
          title="Search Results"
          value={filteredwarehouses.length}
        />

      </div>

      {/* Search */}

      <SectionCard>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <input
            type="text"
            placeholder="Search warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              lg:max-w-sm
              rounded-xl
              border
              border-slate-300
              px-4
              py-3
              outline-none
              transition
              focus:border-[#172B6B]
            "
          />

        </div>

      </SectionCard>

      {/* Table */}

      <SectionCard className="overflow-hidden p-0">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-50 border-b">

              <tr>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Warehouse
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Manager(s)
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredwarehouses.map((warehouse) => (

                <tr
                  key={warehouse._id}
                  className="border-b last:border-0 hover:bg-slate-50 transition"
                >

                  <td className="px-6 py-5 font-semibold text-slate-800">
                    {warehouse.name}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {warehouse.location}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
  {warehouse.managers?.length
  ? warehouse.managers.map((m) => m.name).join(", ")
  : "-"}
</td>

                  <td className="px-6 py-5">

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        warehouse.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {warehouse.status}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => {
                          setEditingWarehouse(warehouse);

                          setNewWarehouse({
                            name: warehouse.name,
                            location: warehouse.location,
                            managers:
warehouse.managers?.map((m) => m._id) || [],
                            status: warehouse.status,
                          });

                          setShowModal(true);
                        }}
                        className="
                          rounded-lg
                          bg-blue-50
                          px-3
                          py-2
                          text-sm
                          font-medium
                          text-blue-700
                          hover:bg-blue-100
                        "
                      >
                        Edit
                      </button>

                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete ${warehouse.name}?`)) {
                            await deleteWarehouse(warehouse._id);
                            fetchwarehouses();
                          }
                        }}
                        className="
                          rounded-lg
                          bg-red-50
                          px-3
                          py-2
                          text-sm
                          font-medium
                          text-red-700
                          hover:bg-red-100
                        "
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

      </SectionCard>

      {/* Keep your existing modal below this exactly as it is */}

    </PageContainer>
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

    <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

      {/* Header */}

      <div className="flex items-start justify-between border-b border-slate-200 px-8 py-6">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            {editingWarehouse
              ? "Edit Warehouse"
              : "Add Warehouse"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Assign warehouse details and inventory managers.
          </p>

        </div>

        <button
          onClick={() => setShowModal(false)}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
        >
          ✕
        </button>

      </div>

      {/* Body */}

      <div className="space-y-6 p-8">

        {/* Warehouse Name */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Warehouse Name
          </label>

          <input
            type="text"
            placeholder="e.g. Floor 1"
            value={newWarehouse.name}
            onChange={(e) =>
              setNewWarehouse({
                ...newWarehouse,
                name: e.target.value,
              })
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
              focus:border-[#172B6B]
            "
          />

        </div>

        {/* Location */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Location
          </label>

          <input
            type="text"
            placeholder="Factory Burari"
            value={newWarehouse.location}
            onChange={(e) =>
              setNewWarehouse({
                ...newWarehouse,
                location: e.target.value,
              })
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
              focus:border-[#172B6B]
            "
          />

        </div>

        {/* Managers */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Inventory Managers
          </label>

          <p className="mb-3 text-sm text-slate-500">
            Select one or more managers for this warehouse.
          </p>

          <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-300 p-4">

            {inventoryUsers.map((user) => (

              <label
                key={user._id}
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  px-4
                  py-3
                  transition
                  hover:bg-slate-50
                "
              >

                <input
                  type="checkbox"
                  checked={newWarehouse.managers.includes(user._id)}
                  onChange={(e) => {

                    if (e.target.checked) {

                      setNewWarehouse({
                        ...newWarehouse,
                        managers: [
                          ...newWarehouse.managers,
                          user._id,
                        ],
                      });

                    } else {

                      setNewWarehouse({
                        ...newWarehouse,
                        managers:
                          newWarehouse.managers.filter(
                            (id) => id !== user._id
                          ),
                      });

                    }

                  }}
                  className="h-4 w-4 accent-[#172B6B]"
                />

                <div>

                  <p className="font-medium text-slate-800">
                    {user.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {user.employeeId}
                  </p>

                </div>

              </label>

            ))}

          </div>

        </div>

        {/* Status */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Status
          </label>

          <select
            value={newWarehouse.status}
            onChange={(e) =>
              setNewWarehouse({
                ...newWarehouse,
                status: e.target.value,
              })
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
              focus:border-[#172B6B]
            "
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

        </div>

      </div>

      {/* Footer */}

      <div className="flex justify-end gap-3 border-t border-slate-200 px-8 py-5">

        <button
          onClick={() => setShowModal(false)}
          className="
            rounded-xl
            border
            border-slate-300
            px-5
            py-3
            font-medium
            text-slate-700
            hover:bg-slate-50
          "
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {

              if (editingWarehouse) {

                await updateWarehouse(
                  editingWarehouse._id,
                  newWarehouse
                );

              } else {

                await createWarehouse(
                  newWarehouse
                );

              }

              await fetchwarehouses();

              setShowModal(false);

              setEditingWarehouse(null);

              setNewWarehouse({
                name: "",
                location: "",
                managers: [],
                status: "ACTIVE",
              });

            } catch (error) {
              console.error(error);
            }
          }}
          className="
            rounded-xl
            bg-[#172B6B]
            px-6
            py-3
            font-semibold
            text-white
            transition
            hover:bg-[#20398F]
          "
        >
          {editingWarehouse
            ? "Update Warehouse"
            : "Create Warehouse"}
        </button>

      </div>

    </div>

  </div>
)}

  </AdminLayout>
);
};

export default WarehousePage;
