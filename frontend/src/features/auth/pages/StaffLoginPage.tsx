import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import logo from "../../../assets/images/logo.png";
import { loginUser } from "../services/auth.service";
import { saveSession } from "../services/authStorage";

const StaffLoginPage = () => {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(
        employeeId,
        password
      );

      if (data.user.role === "FOUNDER") {
        setError(
          "Founder accounts must use Admin Login"
        );

        return;
      }

      await saveSession(
        data.token,
        data.user
      );

      setError("");

      if (
        data.user.role === "INVENTORY"
      ) {
        navigate("/staff/dashboard");
      } else if (
        data.user.role === "PRODUCTION"
      ) {
        navigate("/production-staff");
      } else if (
        data.user.role === "CRM"
      ) {
        navigate("/crm-staff");
      } else if (
        data.user.role === "ACCOUNTANT"
      ) {
        navigate("/accountant");
      } else if (
        data.user.role === "ATTENDANCE/HR"
      ) {
        navigate("/admin/hr");
      } else {
        navigate("/login");
      }
    } catch (error) {
      setError(
        "Invalid Employee ID or Password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F8FC]">

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">

        {/* =================================================
            BACKGROUND
        ================================================= */}

        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#17357A]/[0.045] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-[#FF8A1F]/[0.045] blur-3xl" />

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="relative z-10 w-full max-w-[430px]">

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="mb-8 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">

              <img
                src={logo}
                alt="Toy Hub Corporation"
                className="h-10 w-auto object-contain"
              />

            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
              TOY HUB
            </h1>

            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Corporation
            </p>

          </div>

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">

            <div className="p-6 sm:p-8">

              {/* Header */}

              <div className="mb-8">

                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#17357A]/10 text-[#17357A]">
                  <ShieldCheck
                    size={20}
                    strokeWidth={2}
                  />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Staff access
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue to your
                  department workspace and
                  operational tools.
                </p>

              </div>

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* Employee ID */}

                <div>

                  <label
                    htmlFor="staff-employee-id"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Employee ID
                  </label>

                  <input
                    id="staff-employee-id"
                    type="text"
                    value={employeeId}
                    onChange={(e) =>
                      setEmployeeId(
                        e.target.value
                      )
                    }
                    placeholder="Enter your Employee ID"
                    autoComplete="username"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-[#17357A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

                {/* Password */}

                <div>

                  <label
                    htmlFor="staff-password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="staff-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#17357A] focus:bg-white focus:ring-4 focus:ring-[#17357A]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* Error */}

                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                    <p className="text-sm font-medium leading-5 text-red-600">
                      {error}
                    </p>

                  </div>
                )}

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#17357A] px-5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(23,53,122,0.18)] transition hover:bg-[#10295D] hover:shadow-[0_8px_24px_rgba(23,53,122,0.24)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in

                      <ArrowRight
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </>
                  )}

                </button>

              </form>

              {/* =================================================
                  DIVIDER
              ================================================= */}

              <div className="my-7 flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-100" />

                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Staff workspace
                </span>

                <div className="h-px flex-1 bg-slate-100" />

              </div>

              {/* =================================================
                  ADMIN LOGIN
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/login/admin"
                  )
                }
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >

                <span>
                  Switch to Admin Login
                </span>

                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />

              </button>

            </div>

            {/* Bottom accent */}

            <div className="h-1 bg-[#17357A]" />

          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <p className="mt-6 text-center text-xs text-slate-400">
            Internal operations system
          </p>

        </div>

      </div>

    </main>
  );
};

export default StaffLoginPage;