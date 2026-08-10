import {
  Navigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { getSession } from "../features/auth/services/authStorage";

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({
  children,
  allowedRoles,
}: Props) => {
  const [checking, setChecking] =
    useState(true);

  const [authorized, setAuthorized] =
    useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session =
          await getSession();

        if (
          !session?.token ||
          !session?.user
        ) {
          setAuthorized(false);
          return;
        }

        if (
          !allowedRoles.includes(
            session.user.role
          )
        ) {
          setAuthorized(false);
          return;
        }

        setAuthorized(true);

      } catch (error) {
        console.error(
          "Failed to check session:",
          error
        );

        setAuthorized(false);

      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [allowedRoles]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#17398E]" />

          <p className="mt-4 text-sm text-slate-500">
            Checking session...
          </p>

        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;