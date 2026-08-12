import { useEffect, useState } from "react";
import Sidebar from "../../components/ui/Sidebar";

type Props = {
  children: React.ReactNode;
};

const SIDEBAR_STORAGE_KEY = "toyhub-sidebar-collapsed";

const AdminLayout = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return (
        localStorage.getItem(
          SIDEBAR_STORAGE_KEY
        ) === "true"
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        SIDEBAR_STORAGE_KEY,
        String(collapsed)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [collapsed]);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#F6F7F9]">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* =====================================================
          MAIN CONTENT

          MOBILE:
          No sidebar offset.

          DESKTOP:
          Preserve the existing 64 / 20 sidebar offset.
      ===================================================== */}

      <div
        className={`
          min-w-0
          flex-1
          transition-all
          duration-300
          ease-out

          ${
            collapsed
              ? "ml-0 lg:ml-20"
              : "ml-0 lg:ml-64"
          }
        `}
      >
        <main
          className="
            w-full
            px-4
            py-5
            sm:px-6
            lg:px-8
            lg:py-8
          "
        >
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;