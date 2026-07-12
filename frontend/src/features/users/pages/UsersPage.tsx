import { useMemo, useState } from "react";
import { useEffect } from "react";
import AdminLayout from "../../../app/layouts/AdminLayout";
import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";
import SectionCard from "../../../components/ui/SectionCard";
import StatCard from "../../../components/ui/StatCard";

import InventorySearch from "../../inventory/components/InventorySearch";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service";

const UsersPage = () => {
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  type User = {
    _id: string;
    employeeId: string;
    name: string;
    role: string;
    password?: string;
  };

  const [users, setUsers] = useState<User[]>([]);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    employeeId: "",
    name: "",
    role: "INVENTORY",
    password: "",
  });

  const fetchUsers = async () => {
    try {
      const data = await getUsers();

      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "FOUNDER":
        return "bg-purple-100 text-purple-700";

      case "INVENTORY":
        return "bg-blue-100 text-blue-700";

      case "PRODUCTION":
        return "bg-orange-100 text-orange-700";

      case "ACCOUNTANT":
        return "bg-green-100 text-green-700";

      case "CRM":
        return "bg-pink-100 text-pink-700";

      case "ATTENDANCE/HR":
        return "bg-brown-100 text-brown-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
  <AdminLayout>
    <PageContainer className="space-y-6">

      <PageHeader
        title="User Management"
        subtitle="Manage employee accounts, permissions and system access."
        action={
          <button
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="
              rounded-xl
              bg-[#17357A]
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#24479D]
            "
          >
            + Add User
          </button>
        }
      />

      {/* Stats */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard
          title="Total Employees"
          value={users.length}
        />

       <StatCard
  title="Active Users"
  value={users.length}
/>
        <StatCard
          title="Departments"
          value={
            new Set(users.map((u) => u.role)).size
          }
        />

        <StatCard
          title="Founders"
          value={
            users.filter(
              (u) => u.role === "FOUNDER"
            ).length
          }
        />

      </div>

      {/* Search */}

      <SectionCard>

        <InventorySearch
          value={search}
          onChange={setSearch}
        />

      </SectionCard>

      {/* Users Table */}

      <SectionCard className="overflow-hidden">

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="text-lg font-semibold text-slate-900">
              Employee Directory
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              View and manage registered employees.
            </p>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-50 border-y border-slate-200">

              <tr>

                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Employee
                </th>

                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (

  <tr
    key={user._id}
    className="transition hover:bg-slate-50"
  >

    <td className="px-6 py-5">

      <div className="flex items-center gap-4">

        <div className="h-11 w-11 rounded-full bg-[#17357A] flex items-center justify-center text-white font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div>

          <h3 className="font-semibold text-slate-900">
            {user.name}
          </h3>

          <p className="text-sm text-slate-500">
            {user.employeeId}
          </p>

        </div>

      </div>

    </td>

    <td className="px-6 py-5">

      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleColor(user.role)}`}
      >
        {user.role}
      </span>

    </td>

    <td className="px-6 py-5">

      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Active
      </span>

    </td>

    <td className="px-6 py-5">

      <div className="flex justify-end gap-2">

        <button
          onClick={() => {
            setEditingUser(user);

            setNewUser({
              employeeId: user.employeeId,
              name: user.name,
              role: user.role,
              password: "",
            });

            setShowModal(true);
          }}
          className="
            rounded-lg
            border
            border-slate-200
            px-4
            py-2
            text-sm
            font-medium
            text-slate-700
            transition
            hover:bg-slate-100
          "
        >
          Edit
        </button>

        <button
          onClick={async () => {
            if (
              window.confirm(
                `Delete ${user.name}?`
              )
            ) {
              await deleteUser(user._id);
              fetchUsers();
            }
          }}
          className="
            rounded-lg
            bg-red-50
            px-4
            py-2
            text-sm
            font-medium
            text-red-600
            transition
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

{/* Modal */}

{showModal && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">

  <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">

    <div className="flex items-center justify-between border-b border-slate-200 px-7 py-6">

      <div>

        <h2 className="text-2xl font-bold text-slate-900">
          {editingUser ? "Update User" : "Create User"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage employee account information.
        </p>

      </div>

      <button
        onClick={() => setShowModal(false)}
        className="rounded-xl p-2 hover:bg-slate-100"
      >
        ✕
      </button>

    </div>

    <div className="space-y-5 p-7">

      <div>

        <label className="mb-2 block text-sm font-medium">
          Employee ID
        </label>

        <input
          value={newUser.employeeId}
          onChange={(e) =>
            setNewUser({
              ...newUser,
              employeeId: e.target.value,
            })
          }
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17357A]"
        />

      </div>

      <div>

        <label className="mb-2 block text-sm font-medium">
          Employee Name
        </label>

        <input
          value={newUser.name}
          onChange={(e) =>
            setNewUser({
              ...newUser,
              name: e.target.value,
            })
          }
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17357A]"
        />

      </div>

      <div>

        <label className="mb-2 block text-sm font-medium">
          Role
        </label>

        <select
          value={newUser.role}
          onChange={(e) =>
            setNewUser({
              ...newUser,
              role: e.target.value,
            })
          }
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17357A]"
        >
          <option value="FOUNDER">Founder</option>
          <option value="INVENTORY">Inventory</option>
          <option value="PRODUCTION">Production</option>
          <option value="CRM">CRM</option>
          <option value="ACCOUNTANT">Accountant</option>
          <option value="ATTENDANCE/HR">Attendance / HR</option>
        </select>

      </div>

      <div>

        <label className="mb-2 block text-sm font-medium">
          Password
        </label>

        <input
          type="password"
          value={newUser.password}
          onChange={(e) =>
            setNewUser({
              ...newUser,
              password: e.target.value,
            })
          }
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17357A]"
        />

      </div>

    </div>

    <div className="flex justify-end gap-3 border-t border-slate-200 px-7 py-5">

      <button
        onClick={() => setShowModal(false)}
        className="rounded-xl border border-slate-200 px-5 py-3 font-medium hover:bg-slate-100"
      >
        Cancel
      </button>

      <button
        onClick={async () => {
          if (editingUser) {
            await updateUser(editingUser._id, newUser);
            setEditingUser(null);
          } else {
            await createUser(newUser);
          }

          await fetchUsers();

          setNewUser({
            employeeId: "",
            name: "",
            role: "INVENTORY",
            password: "",
          });

          setShowModal(false);
        }}
        className="rounded-xl bg-[#17357A] px-6 py-3 font-semibold text-white hover:bg-[#24479D]"
      >
        {editingUser ? "Update User" : "Create User"}
      </button>

    </div>

  </div>

</div>

)}

</PageContainer>

</AdminLayout>

);
};

export default UsersPage;
