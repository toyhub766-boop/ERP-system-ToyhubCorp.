import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
} from "react-icons/fi";

import logo from "../../../assets/images/logo.png";

const LoginSelectorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#3458D4_0%,#203D9C_45%,#142B6F_100%)] flex flex-col items-center justify-center px-6 py-10">

      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="flex justify-center m-8">
          <div className="h-28 w-28 rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl flex items-center justify-center">
            <img
              src={logo}
              alt="Toy Hub"
              className="h-12 object-contain"
            />
          </div>
        </div>

        {/* Heading */}

        <div className="text-center mt-8">
          <h1 className="mt-8 text-white text-3xl font-bold tracking-tight">
            TOYHUB Corp.
          </h1>

          <p className="mt-3 text-blue-100 text-md font-medium">
            Inventory & Operations System
          </p>

          <p className="mt-12 mb-5 text-blue-100/80 text-sm">
  Select your login type to continue
</p>
        </div>

        {/* Cards */}

        <div className="mt-10 flex flex-col gap-3">

          {/* Staff */}

          <button
            onClick={() => navigate("/login/staff")}
            className="group w-full h-20 bg-white rounded-2xl px-6 flex items-center justify-between shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
          >

            <div className="flex items-center gap-4">

              <div className="text-left">

                <h3 className="font-bold text-slate-900 text-xl">
                  Staff App
                </h3>

                <p className="text-slate-500 text-sm">
                  Department Staff Access
                </p>

              </div>

            </div>

            <FiArrowRight
              size={22}
              className="text-slate-400 group-hover:translate-x-1 transition-transform"
            />

          </button>

          {/* Admin */}

          <button
            onClick={() => navigate("/login/admin")}
            className="group w-full h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl px-6 flex items-center justify-between shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
          >

            <div className="flex items-center gap-4">

              <div className="text-left">

                <h3 className="font-bold text-xl text-white">
                  Admin Dashboard
                </h3>

                <p className="text-orange-100 text-sm">
                  Founder & Management Access
                </p>

              </div>

            </div>

            <FiArrowRight
              size={22}
              className="text-white group-hover:translate-x-1 transition-transform"
            />

          </button>

        </div>

      </div>

      {/* Footer */}

      <div className="absolute bottom-6 text-center">

        <p className="text-xs text-blue-100/60">
          © {new Date().getFullYear()} Toy Hub Corporation
        </p>

        <p className="text-xs text-blue-100/60">
          Developed by HoneyFootnotes*
        </p>

      </div>

    </div>
  );
};

export default LoginSelectorPage;