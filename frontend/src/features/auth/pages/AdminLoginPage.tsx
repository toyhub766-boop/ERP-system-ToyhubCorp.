import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../../assets/images/logo.png";
import { loginUser } from "../services/auth.service";
import { Eye, EyeOff } from "lucide-react";

const AdminLoginPage = () => {
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

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">

          <div className="text-center mb-8">

            <h1 className="text-2xl font-semibold text-slate-900">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Founder &amp; Management Access
            </p>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Sign in to access your operations dashboard.
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Employee ID
              </label>

              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter your Employee ID"
                className="w-full h-11 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-orange-500"
              />

            </div>

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
        focus:border-orange-500
        focus:ring-2
        focus:ring-orange-100
      "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
        absolute
        right-3
        top-1/2
        -translate-y-1/2
        text-slate-400
        hover:text-slate-600
        transition
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
              <p className="text-sm text-red-500 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition"
            >
              Sign In
            </button>

          </form>

          <div className="mt-7 text-center">

            <button
              type="button"
              onClick={() => navigate("/login/staff")}
              className="mt-5 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Switch to Staff Login
            </button>

          </div>

        </div>

      </div>

    </div>

  );
};

export default AdminLoginPage;