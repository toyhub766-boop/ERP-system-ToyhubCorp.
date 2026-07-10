import { useMemo, useState } from "react";
import { useEffect } from "react";
import AdminLayout from "../../../app/layouts/AdminLayout";

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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>

          <p className="text-slate-500 mt-2">
            Manage employee accounts, permissions and roles.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
    bg-orange-500
    hover:bg-orange-600
    text-white
    px-5
    py-3
    rounded-xl
    font-medium
    shadow-sm
  "
        >
          + Add User
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border rounded-2xl p-5">
          <p className="text-slate-500 text-sm">Total Employees</p>

          <h2 className="text-3xl font-bold mt-2">{users.length}</h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p className="text-slate-500 text-sm">Active Users</p>

          <h2 className="text-3xl font-bold mt-2 text-green-600">
            {users.length}
          </h2>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <p className="text-slate-500 text-sm">Departments</p>

          <h2 className="text-3xl font-bold mt-2">5</h2>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* Search */}
        <div className="p-5 border-b">
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              md:w-80
              px-4
              py-3
              rounded-xl
              border
              border-slate-300
              outline-none
              focus:border-orange-500
            "
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Employee ID
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Name
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Role
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Status
                </th>

                <th className="text-right px-6 py-4 text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.employeeId}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="px-6 py-5 font-medium">{user.employeeId}</td>

                  <td className="px-6 py-5">{user.name}</td>

                  <td className="px-6 py-5">
                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-medium
                        ${getRoleColor(user.role)}
                      `}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      Active
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditingUser(user);

                          setNewUser({
                            employeeId: user.employeeId,
                            name: user.name,
                            role: user.role,
                            password: user.password || "",
                          });

                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={async() => {
                          const confirmDelete = window.confirm(
                            `Delete ${user.name}?`,
                          );

                          if (confirmDelete) {
                            try {
                              await deleteUser(user._id);

                              await fetchUsers();
                            } catch (error) {
                              console.error(error);
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
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
        <div
          className="
      fixed
      inset-0
      bg-black/40
      flex
      items-center
      justify-center
      z-50
      p-4
    "
        >
          <div
            className="
        bg-white
        rounded-2xl
        w-full
        max-w-lg
        p-6
      "
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingUser ? "Edit User" : "Add User"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Employee ID"
                value={newUser.employeeId}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    employeeId: e.target.value,
                  })
                }
                className="
            w-full
            border
            rounded-xl
            px-4
            py-3
          "
              />

              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    name: e.target.value,
                  })
                }
                className="
            w-full
            border
            rounded-xl
            px-4
            py-3
          "
              />

              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role: e.target.value,
                  })
                }
                className="
            w-full
            border
            rounded-xl
            px-4
            py-3
          "
              >
                <option value="FOUNDER">Founder</option>

                <option value="INVENTORY">Inventory</option>

                <option value="PRODUCTION">Production</option>

                <option value="ACCOUNTANT">Accountant</option>

                <option value="CRM">CRM</option>
              

              <option value="ATTENDANCE/HR">ATTENDANCE/HR</option>
              </select>

              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    password: e.target.value,
                  })
                }
                className="
            w-full
            border
            rounded-xl
            px-4
            py-3
          "
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="
              px-5
              py-3
              border
              rounded-xl
            "
                >
                  Cancel
                </button>

                <button
                  className="
              px-5
              py-3
              bg-orange-500
              text-white
              rounded-xl
            "
                  onClick={async () => {
                    try {
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
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                >
                  {editingUser ? "Update User" : "Create User"}{" "}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersPage;
