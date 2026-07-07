import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../../assets/images/logo.png";
import { loginUser } from "../services/auth.service";

const AdminLoginPage = () => {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  try {
    const data = await loginUser(
      employeeId,
      password
    );

    if (
      data.user.role !== "FOUNDER"
    ) {
      setError(
        "Access denied. Admin account required."
      );
      return;
    }

    localStorage.setItem(
      "token",
      data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    setError("");

    navigate("/admin/dashboard");
  } catch (error) {
    setError(
      "Invalid Employee ID or Password"
    );
  }
};

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt="Toy Hub"
            className="h-16 w-auto mb-4"
          />

          <h1 className="text-2xl font-bold text-slate-900">
            Admin Login
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Founder & Management Access
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label className="block mb-2 text-sm font-medium">
              Employee ID
            </label>

            <input
              type="text"
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(e.target.value)
              }
              placeholder="EMP-001"
              className="
                w-full
                px-4
                py-3
                border
                border-slate-300
                rounded-xl
                outline-none
                focus:border-orange-500
              "
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              className="
                w-full
                px-4
                py-3
                border
                border-slate-300
                rounded-xl
                outline-none
                focus:border-orange-500
              "
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="
              w-full
              py-3
              rounded-xl
              bg-orange-500
              hover:bg-orange-600
              text-white
              font-medium
              transition
            "
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          EMP-001 / admin123
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;