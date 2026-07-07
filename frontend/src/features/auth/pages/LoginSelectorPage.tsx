import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo.png";

const LoginSelectorPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-b
        from-[#142B6F]
        to-[#3558D4]
        flex
        items-center
        justify-center
        p-6
      "
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="
              h-28
              w-28
              mx-auto
              rounded-3xl
              bg-white/10
              backdrop-blur-sm
              flex
              items-center
              justify-center
              border
              border-white/20
            "
          >
            <img
              src={logo}
              alt="Toy Hub"
              className="h-14"
            />
          </div>

          <h1 className="text-white text-4xl font-bold mt-8">
            TOY HUB
          </h1>

          <p className="text-blue-100 mt-2">
            Inventory & Operations System
          </p>
        </div>

        {/* Login Type Cards */}

        <div className="space-y-5">

          <button
            onClick={() => navigate("/login/staff")}
            className="
              w-full
              bg-white
              rounded-3xl
              p-6
              flex
              justify-between
              items-center
              shadow-xl
              hover:scale-[1.02]
              transition
            "
          >
            <div className="text-left">
              <h3 className="font-semibold text-lg">
                Staff App
              </h3>

              <p className="text-slate-500 text-sm">
                Warehouse & Inventory Staff
              </p>
            </div>

            <span className="text-xl">
              →
            </span>
          </button>

          <button
            onClick={() => navigate("/login/admin")}
            className="
              w-full
              bg-orange-500
              rounded-3xl
              p-6
              flex
              justify-between
              items-center
              shadow-xl
              text-white
              hover:bg-orange-600
              transition
            "
          >
            <div className="text-left">
              <h3 className="font-semibold text-lg">
                Admin Dashboard
              </h3>

              <p className="text-orange-100 text-sm">
                Founder & Management
              </p>
            </div>

            <span className="text-xl">
              →
            </span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default LoginSelectorPage;