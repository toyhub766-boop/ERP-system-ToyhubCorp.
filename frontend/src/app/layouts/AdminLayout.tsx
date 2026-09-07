import { useEffect, useState } from "react";

import Sidebar from "../../components/ui/Sidebar";

type Props = {
  children: React.ReactNode;
};

const SIDEBAR_STORAGE_KEY =
  "toyhub-sidebar-collapsed";

const AdminLayout = ({
  children,
}: Props) => {
  const [collapsed, setCollapsed] =
    useState(() => {
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
    <div
      className="
        flex
        h-screen
        overflow-hidden
        bg-[#F6F7F9]
      "
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* =====================================================
          MAIN APPLICATION AREA
      ===================================================== */}

      <div
        className={`
          flex
          h-screen
          min-w-0
          flex-1
          flex-col
          overflow-hidden
          transition-[margin]
          duration-300
          ease-out
          ${
            collapsed
              ? "ml-0 lg:ml-20"
              : "ml-0 lg:ml-64"
          }
        `}
      >
        {/* ===================================================
            MODULE VIEWPORT
        =================================================== */}

        <main
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1600px]
              px-4
              py-5
              sm:px-6
              lg:px-8
              lg:py-8
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;