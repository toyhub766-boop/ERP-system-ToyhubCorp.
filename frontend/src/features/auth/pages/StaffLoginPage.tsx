import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../../assets/images/logo.png";
import { loginUser } from "../services/auth.service";

import { Eye, EyeOff } from "lucide-react";

const StaffLoginPage = () => {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

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
} else if (data.user.role === "ATTENDANCE/HR") {
  navigate("/admin/hr");
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
  <div className="min-h-screen flex items-center justify-center px-6 py-10">

    <div className="w-full max-w-[380px]">

      {/* Logo */}

      <div className="flex flex-col items-center mb-8">

        <img
          src={logo}
          alt="Toy Hub"
          className="h-16 w-auto"
        />

        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          TOY HUB
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Corporation
        </p>

      </div>

      {/* Login Card */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">

        <div className="text-center mb-8">

          <h1 className="text-2xl font-semibold text-slate-900">
            Staff Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Inventory & Production Staff Access
          </p>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            Sign in to continue to your staff dashboard.
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* Employee ID */}

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Employee ID
            </label>

            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter your Employee ID"
              className="
                w-full
                h-11
                rounded-xl
                border
                border-slate-300
                px-4
                text-sm
                outline-none
                transition
                focus:border-[#17398E]
                focus:ring-2
                focus:ring-blue-100
              "
            />

          </div>

          {/* Password */}

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="
                  w-full
                  h-11
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  pr-11
                  text-sm
                  outline-none
                  transition
                  focus:border-[#17398E]
                  focus:ring-2
                  focus:ring-blue-100
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  hover:text-slate-600
                "
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {error && (
            <p className="text-sm text-center text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="
              w-full
              h-11
              rounded-xl
              bg-[#17398E]
              hover:bg-[#1d47b3]
              text-white
              text-sm
              font-semibold
              transition
            "
          >
            Sign In
          </button>

        </form>

        <div className="mt-7 text-center">

          <button
            type="button"
            onClick={() => navigate("/login/admin")}
            className="
              mt-5
              text-sm
              font-medium
              text-blue-600
              hover:text-blue-700
            "
          >
            ← Switch to Admin Login
          </button>

        </div>

      </div>

    </div>

  </div>
);
};

export default StaffLoginPage;