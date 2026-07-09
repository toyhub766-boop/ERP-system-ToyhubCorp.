import type { ReactNode } from "react";
import AccountantSidebar from "../components/AccountantSidebar";
interface Props {
    children: ReactNode;
}

const AccountantLayout = ({ children }: Props) => {
    return (
        <div className="min-h-screen flex bg-slate-100">
            <AccountantSidebar />

            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default AccountantLayout;