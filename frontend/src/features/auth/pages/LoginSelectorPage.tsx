import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
} from "lucide-react";

import logo from "../../../assets/images/logo.png";

const LoginSelectorPage = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F6F8FC]">

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">

        {/* =================================================
            BACKGROUND DECORATION
        ================================================= */}

        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#17357A]/[0.045] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#FF8A1F]/[0.045] blur-3xl" />

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="relative z-10 w-full max-w-[470px]">

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
              CARD
          ================================================= */}

          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">

            {/* Header */}

            <div className="mb-7">

              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#17357A]">
                Internal Operations
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose the workspace you need to
                access.
              </p>

            </div>

            {/* =================================================
                LOGIN OPTIONS
            ================================================= */}

            <div className="space-y-3">

              {/* STAFF */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/login/staff"
                  )
                }
                className="group flex min-h-[84px] w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] active:translate-y-0"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-[#17357A]/10 group-hover:text-[#17357A]">

                  <BriefcaseBusiness
                    size={20}
                    strokeWidth={2}
                  />

                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="text-base font-semibold text-slate-900">
                    Staff App
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Department staff access
                  </p>

                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition group-hover:bg-white group-hover:text-[#17357A]">

                  <ArrowRight
                    size={18}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />

                </div>

              </button>

              {/* ADMIN */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/login/admin"
                  )
                }
                className="group flex min-h-[84px] w-full items-center gap-4 rounded-2xl border border-[#17357A] bg-[#17357A] p-4 text-left shadow-[0_8px_24px_rgba(23,53,122,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#10295D] hover:shadow-[0_12px_30px_rgba(23,53,122,0.22)] active:translate-y-0"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">

                  <ShieldCheck
                    size={20}
                    strokeWidth={2}
                  />

                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="text-base font-semibold text-white">
                    Admin Dashboard
                  </h3>

                  <p className="mt-1 text-sm text-blue-100/75">
                    Founder &amp; management access
                  </p>

                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/60 transition group-hover:bg-white/10 group-hover:text-white">

                  <ArrowRight
                    size={18}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />

                </div>

              </button>

            </div>

            {/* =================================================
                SECURITY NOTE
            ================================================= */}

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">

              <ShieldCheck
                size={14}
              />

              <span>
                Authorized personnel only
              </span>

            </div>

          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="mt-6 text-center">

            <p className="text-xs text-slate-400">
              ©{" "}
              {new Date().getFullYear()}{" "}
              Toy Hub Corporation
            </p>

            <p className="mt-1 text-[11px] text-slate-300">
              Developed by HoneyFootnotes
            </p>

          </div>

        </div>

      </div>

    </main>
  );
};

export default LoginSelectorPage;