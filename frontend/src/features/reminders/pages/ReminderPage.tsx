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

  const filteredReminders =
    useMemo(() => {

      let data = [...reminders];

      if (search) {

        const term =
          search.toLowerCase();

        data = data.filter((r) =>
          r.title
            .toLowerCase()
            .includes(term)
        );

      }

      if (statusFilter === "PENDING") {

  data = data.filter(
    (r) => r.status === "PENDING"
  );

}

else if (statusFilter === "COMPLETED") {

  data = data.filter(
    (r) => r.status === "COMPLETED"
  );

}

else if (statusFilter === "OVERDUE") {

  data = data.filter(
    (r) =>
      r.status === "PENDING" &&
      new Date(r.dueDate) < new Date()
  );

}

      if (moduleFilter !== "ALL") {

        data = data.filter(
          (r) =>
            r.module ===
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

      const handleDelete = async (
    id: string
  ) => {
    if (
      !window.confirm(
        "Delete this reminder?"
      )
    )
      return;

    try {
      await deleteReminder(id);

      await loadReminders();
    } catch (error) {
      console.error(error);
    }
  };

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

  return (
    <AdminLayout>

      <PageContainer className="space-y-6">

        <PageHeader
          title="Reminder System"
          subtitle="Manage CRM & Accounts reminders"
        />

        <ReminderFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          moduleFilter={moduleFilter}
          setModuleFilter={setModuleFilter}
          onAdd={() => {
            setEditReminder(null);
            setModalOpen(true);
          }}
        />

        {loading ? (

          <div className="flex justify-center py-20">

            Loading...

          </div>

        ) : filteredReminders.length === 0 ? (

          <div className="rounded-xl border bg-white py-20 text-center">

            <h3 className="text-2xl font-bold">
              No Reminders
            </h3>

            <p className="mt-2 text-slate-500">
              Create your first reminder.
            </p>

          </div>

        ) : (

          <div className="grid gap-5">

            {filteredReminders.map(
              (reminder) => (

                <ReminderCard
                  key={reminder._id}
                  reminder={reminder}
                  onEdit={() => {
                    setEditReminder(reminder);
                    setModalOpen(true);
                  }}
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

        <ReminderModal
          open={modalOpen}
          editReminder={editReminder}
          onClose={() => {
            setModalOpen(false);
            setEditReminder(null);
          }}
          onSuccess={async () => {
            await loadReminders();

            setModalOpen(false);

            setEditReminder(null);
          }}
        />

      </PageContainer>

    </AdminLayout>
  );
};

export default ReminderPage;