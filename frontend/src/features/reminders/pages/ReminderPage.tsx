import { useEffect, useMemo, useState } from "react";

import AdminLayout from "../../../app/layouts/AdminLayout";
import PageContainer from "../../../components/ui/PageContainer";
import PageHeader from "../../../components/ui/PageHeader";

import ReminderCard from "../components/ReminderCard";
import ReminderModal from "../components/ReminderModal";
import ReminderFilters from "../components/ReminderFilters";

import {
  getReminders,
  deleteReminder,
  completeReminder,
} from "../services/reminder.service";

const ReminderPage = () => {
  const [reminders, setReminders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editReminder, setEditReminder] =
    useState<any>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [moduleFilter, setModuleFilter] =
    useState("ALL");

  /* ============================================================
     LOAD REMINDERS
  ============================================================ */

  const loadReminders = async () => {
    try {
      setLoading(true);

      const data =
        await getReminders();

      setReminders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  /* ============================================================
     FILTERING
  ============================================================ */

  const filteredReminders =
    useMemo(() => {
      let data = [...reminders];

      if (search.trim()) {
        const term =
          search.trim().toLowerCase();

        data = data.filter(
          (reminder) =>
            reminder.title
              ?.toLowerCase()
              .includes(term)
        );
      }

      if (statusFilter === "PENDING") {
        data = data.filter(
          (reminder) =>
            reminder.status === "PENDING"
        );
      } else if (
        statusFilter === "COMPLETED"
      ) {
        data = data.filter(
          (reminder) =>
            reminder.status === "COMPLETED"
        );
      } else if (
        statusFilter === "OVERDUE"
      ) {
        data = data.filter(
          (reminder) =>
            reminder.status === "PENDING" &&
            new Date(reminder.dueDate) <
              new Date()
        );
      }

      if (moduleFilter !== "ALL") {
        data = data.filter(
          (reminder) =>
            reminder.module ===
            moduleFilter
        );
      }

      return data;
    }, [
      reminders,
      search,
      statusFilter,
      moduleFilter,
    ]);

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDelete = async (
    id: string
  ) => {
    if (
      !window.confirm(
        "Delete this reminder?"
      )
    ) {
      return;
    }

    try {
      await deleteReminder(id);

      await loadReminders();
    } catch (error) {
      console.error(error);
    }
  };

  /* ============================================================
     COMPLETE
  ============================================================ */

  const handleComplete = async (
    id: string
  ) => {
    try {
      await completeReminder(id);

      await loadReminders();
    } catch (error) {
      console.error(error);
    }
  };

  /* ============================================================
     ADD
  ============================================================ */

  const handleAdd = () => {
    setEditReminder(null);
    setModalOpen(true);
  };

  /* ============================================================
     EDIT
  ============================================================ */

  const handleEdit = (
    reminder: any
  ) => {
    setEditReminder(reminder);
    setModalOpen(true);
  };

  /* ============================================================
     CLOSE MODAL
  ============================================================ */

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditReminder(null);
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AdminLayout>
      <PageContainer
        className="
          space-y-5
          pb-6
          sm:space-y-6
        "
      >
        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <div
          className="
            shrink-0
          "
        >
          <PageHeader
            title="Reminder System"
            subtitle="Manage CRM & Accounts reminders"
          />
        </div>

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <ReminderFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={
            setStatusFilter
          }
          moduleFilter={moduleFilter}
          setModuleFilter={
            setModuleFilter
          }
          onAdd={handleAdd}
        />

        {/* ======================================================
            RESULTS HEADER
        ====================================================== */}

        {!loading &&
          filteredReminders.length > 0 && (
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
                px-1
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  Reminders
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-400
                  "
                >
                  {filteredReminders.length}{" "}
                  {filteredReminders.length ===
                  1
                    ? "reminder"
                    : "reminders"}{" "}
                  found
                </p>
              </div>
            </div>
          )}

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading ? (
          <div
            className="
              flex
              min-h-[260px]
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-[0_2px_12px_rgba(15,23,42,0.04)]
            "
          >
            <div className="text-center">
              <div
                className="
                  mx-auto
                  h-8
                  w-8
                  animate-spin
                  rounded-full
                  border-2
                  border-slate-200
                  border-t-[#17357A]
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-medium
                  text-slate-500
                "
              >
                Loading reminders...
              </p>
            </div>
          </div>
        ) : filteredReminders.length ===
          0 ? (
          /* ====================================================
             EMPTY STATE
          ==================================================== */

          <div
            className="
              flex
              min-h-[280px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-5
              py-12
              text-center
              shadow-[0_2px_12px_rgba(15,23,42,0.03)]
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-lg
              "
            >
              ✓
            </div>

            <h3
              className="
                mt-4
                text-lg
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              No reminders found
            </h3>

            <p
              className="
                mt-1.5
                max-w-sm
                text-sm
                leading-5
                text-slate-500
              "
            >
              {search ||
              statusFilter !== "ALL" ||
              moduleFilter !== "ALL"
                ? "Try adjusting your filters or search."
                : "Create your first reminder to keep important tasks on track."}
            </p>

            {!search &&
              statusFilter === "ALL" &&
              moduleFilter === "ALL" && (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="
                    mt-5
                    rounded-xl
                    bg-[#17357A]
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#10295d]
                    active:scale-[0.98]
                  "
                >
                  + Add Reminder
                </button>
              )}
          </div>
        ) : (
          /* ====================================================
             REMINDER LIST
          ==================================================== */

          <div
            className="
              grid
              gap-3.5
              sm:gap-4
              lg:gap-5
            "
          >
            {filteredReminders.map(
              (reminder) => (
                <ReminderCard
                  key={reminder._id}
                  reminder={reminder}
                  onEdit={() =>
                    handleEdit(
                      reminder
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      reminder._id
                    )
                  }
                  onComplete={() =>
                    handleComplete(
                      reminder._id
                    )
                  }
                />
              )
            )}
          </div>
        )}

        {/* ======================================================
            MODAL
        ====================================================== */}

        <ReminderModal
          open={modalOpen}
          editReminder={
            editReminder
          }
          onClose={
            handleCloseModal
          }
          onSuccess={async () => {
            await loadReminders();

            handleCloseModal();
          }}
        />
      </PageContainer>
    </AdminLayout>
  );
};

export default ReminderPage;