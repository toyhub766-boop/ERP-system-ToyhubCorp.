interface Props {
    search: string;
    setSearch: (value: string) => void;

    statusFilter: string;
    setStatusFilter: (value: string) => void;

    moduleFilter: string;
    setModuleFilter: (value: string) => void;

    onAdd: () => void;
}

const ReminderFilters = ({
    search,
    setSearch,

    statusFilter,
    setStatusFilter,

    moduleFilter,
    setModuleFilter,

    onAdd,
}: Props) => {
    return (
        <div className="rounded-2xl border bg-white p-5">

            <div className="grid gap-4 md:grid-cols-4">

                <input
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search reminder..."
                    className="rounded-xl border px-4 py-3"
                />

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                    className="rounded-xl border px-4 py-3"
                >

                    <option value="ALL">
                        All Status
                    </option>

                    <option value="PENDING">
                        Pending
                    </option>

                    <option value="COMPLETED">
                        Completed
                    </option>

                    <option value="OVERDUE">
                        Overdue
                    </option>

                </select>

                <select
                    value={moduleFilter}
                    onChange={(e) =>
                        setModuleFilter(e.target.value)
                    }
                    className="rounded-xl border px-4 py-3"
                >
                    <option value="ALL">
                        All Modules
                    </option>

                    <option value="CRM">
                        CRM
                    </option>

                    <option value="ACCOUNTS">
                        Accounts
                    </option>
                </select>

                <button
                    onClick={onAdd}
                    className="rounded-xl bg-[#17357A] px-4 py-3 font-semibold text-white"
                >
                    + Add Reminder
                </button>

            </div>

        </div>
    );
};

export default ReminderFilters;