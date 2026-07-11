import { FiBell} from "react-icons/fi";

const Topbar = () => {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );
  return (
    <header
      className="
        h-20
        bg-white
        border-b
        border-slate-200
        px-8
        flex
        items-center
        justify-between
        shadow-sm
      "
    >
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

        <p className="text-sm text-slate-500">Inventory Operations Overview</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Search */}
        
        <div className="hidden lg:block">
          <input
            type="text"
            placeholder="Search..."
            className="
      w-72
      h-11
      pl-10
      pr-4
      rounded-xl
      border
      border-slate-200
      bg-white
      text-sm
      outline-none
      focus:border-[#243B8F]
      focus:ring-2
      focus:ring-blue-100
    "
          />
        </div>
        {/* Notifications */}
        <button
          className="
            h-11
            w-11
            rounded-xl
            border
            border-slate-200
            flex
            items-center
            justify-center
            hover:bg-slate-50
          "
        >
          <FiBell size={18} />
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-slate-900">{user.name}</p>

            <p className="text-sm text-slate-500">Founder</p>
          </div>

          <div
            className="
              h-12
              w-12
              rounded-full
              bg-[#FF7A00]
              text-white
              flex
              items-center
              justify-center
              font-bold
            "
          >
            {user.name[0]}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
