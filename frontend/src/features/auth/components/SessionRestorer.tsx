import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getSession } from "../services/authStorage";

const getDashboardRoute = (
  role: string
) => {
  switch (role) {
    case "FOUNDER":
      return "/admin/dashboard";

    case "INVENTORY":
      return "/staff/dashboard";

    case "PRODUCTION":
      return "/production-staff";

    case "CRM":
      return "/crm-staff";

    case "ACCOUNTANT":
      return "/accountant";

    case "ATTENDANCE/HR":
      return "/admin/hr";

    default:
      return "/login";
  }
};

const SessionRestorer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [checkingSession, setCheckingSession] =
    useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await getSession();

        /*
         * No saved session.
         * Allow the normal login page to appear.
         */
        if (!session?.token || !session?.user) {
          setCheckingSession(false);
          return;
        }

        /*
         * User already has a saved session.
         * Send them to their role dashboard.
         */
        const dashboard =
          getDashboardRoute(
            session.user.role
          );

        /*
         * If they are already somewhere
         * inside the authenticated application,
         * don't redirect again.
         */
        const isLoginPage =
          location.pathname === "/login" ||
          location.pathname === "/login/admin" ||
          location.pathname === "/login/staff";

        if (isLoginPage) {
          navigate(
            dashboard,
            {
              replace: true,
            }
          );
        }

      } catch (error) {
        console.error(
          "Failed to restore session:",
          error
        );
      } finally {
        setCheckingSession(false);
      }
    };

    restoreSession();

  }, [navigate, location.pathname]);

  /*
   * Prevent login/dashboard UI from flashing
   * while we check persistent storage.
   */
  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#17398E]" />

          <p className="mt-4 text-sm text-slate-500">
            Restoring session...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default SessionRestorer;