import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../../assets/images/logo.png";
import { loginUser } from "../services/auth.service";

const StaffLoginPage = () => {
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
      data.user.role === "FOUNDER"
    ) {
      setError(
        "Founder accounts must use Admin Login"
      );
      return;
    }

    localStorage.setItem(
      "token",
      data.token
    );
console.log(data.user);
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)

    );

    setError("");

    if (data.user.role === "INVENTORY") {
  navigate("/staff/dashboard");
} else if (data.user.role === "PRODUCTION") {
  navigate("/production-staff");
} else if (data.user.role === "CRM") {
  navigate("/crm-staff");
} else if (data.user.role === "ACCOUNTANT") {
  navigate("/accountant");
} else {
  navigate("/login");
}
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
            Staff Login
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Inventory & Production Staff Access
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
              placeholder="EMP-002"
              className="
                w-full
                px-4
                py-3
                border
                border-slate-300
                rounded-xl
                outline-none
                focus:border-[#172B6B]
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
                focus:border-[#172B6B]
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
              bg-[#172B6B]
              hover:bg-[#223a88]
              text-white
              font-medium
              transition
            "
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          EMP-002 / staff123
          <br />
          EMP-003 / staff123
          <br />
          EMP-004 / staff123
          <br />
          EMP-005 / staff123
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;