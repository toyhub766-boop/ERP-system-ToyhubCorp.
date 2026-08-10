import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiCheckSquare,
  FiChevronRight,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

interface User {
  _id: string;
  name: string;
  role: string;
  employeeId?: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistNote {
  id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  remarks: string;
  items: ChecklistItem[];
  createdAt: string;
}

interface Props {
  users: User[];
}

const UserChecklistWorkspace = ({
  users,
}: Props) => {
  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [search, setSearch] =
    useState("");

  const [notes, setNotes] =
    useState<ChecklistNote[]>([]);

  const [showNoteEditor, setShowNoteEditor] =
    useState(false);

  const [selectedNote, setSelectedNote] =
    useState<ChecklistNote | null>(null);

  const filteredUsers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      `${user.name} ${user.role} ${user.employeeId || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  const userNotes = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    return notes;
  }, [notes, selectedUser]);

  const createNote = () => {
    const newNote: ChecklistNote = {
      id: Date.now().toString(),
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
      remarks: "",
      items: [
        {
          id: `${Date.now()}-1`,
          text: "",
          completed: false,
        },
      ],
      createdAt:
        new Date().toISOString(),
    };

    setNotes((previous) => [
      ...previous,
      newNote,
    ]);

    setSelectedNote(newNote);
    setShowNoteEditor(true);
  };

  const updateNote = (
    updatedNote: ChecklistNote
  ) => {
    setNotes((previous) =>
      previous.map((note) =>
        note.id === updatedNote.id
          ? updatedNote
          : note
      )
    );

    setSelectedNote(updatedNote);
  };

  const deleteNote = (
    noteId: string
  ) => {
    setNotes((previous) =>
      previous.filter(
        (note) => note.id !== noteId
      )
    );

    if (
      selectedNote?.id === noteId
    ) {
      setSelectedNote(null);
      setShowNoteEditor(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* =====================================================
          USER SELECTOR
      ====================================================== */}

      {!selectedUser ? (

        <div className="flex min-h-[620px]">

          {/* LEFT */}

          <div className="w-full border-r border-slate-200 lg:w-[360px]">

            <div className="border-b border-slate-200 px-6 py-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#17357A]">
                  <FiCheckSquare
                    size={21}
                  />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    User Checklists
                  </h2>

                  <p className="text-sm text-slate-500">
                    Select a user to manage tasks.
                  </p>

                </div>

              </div>

              {/* Search */}

              <div className="relative mt-5">

                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search users..."
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-[#17357A]
                    focus:bg-white
                  "
                />

              </div>

            </div>

            {/* USER LIST */}

            <div className="max-h-[520px] overflow-y-auto p-3">

              {filteredUsers.length === 0 ? (

                <div className="px-5 py-12 text-center">

                  <FiUser
                    size={26}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No users found
                  </p>

                </div>

              ) : (

                <div className="space-y-1">

                  {filteredUsers.map(
                    (user) => (

                      <button
                        key={user._id}
                        type="button"
                        onClick={() =>
                          setSelectedUser(
                            user
                          )
                        }
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-2xl
                          px-3
                          py-3
                          text-left
                          transition
                          hover:bg-slate-50
                        "
                      >

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">

                          {user.name
                            ?.charAt(0)
                            .toUpperCase()}

                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {user.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {user.role}
                            {user.employeeId
                              ? ` • ${user.employeeId}`
                              : ""}
                          </p>

                        </div>

                        <FiChevronRight
                          size={17}
                          className="text-slate-300"
                        />

                      </button>

                    )
                  )}

                </div>

              )}

            </div>

          </div>

          {/* EMPTY RIGHT SIDE */}

          <div className="hidden flex-1 items-center justify-center bg-slate-50 lg:flex">

            <div className="max-w-sm text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">

                <FiUser
                  size={26}
                  className="text-slate-300"
                />

              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-800">
                Select a user
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose an employee from the
                list to manage their tasks,
                checklists and progress.
              </p>

            </div>

          </div>

        </div>

      ) : (

        /* =====================================================
           SELECTED USER WORKSPACE
        ====================================================== */

        <div className="min-h-[620px]">

          {/* HEADER */}

          <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-7">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedNote(null);
                    setShowNoteEditor(false);
                  }}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    text-slate-500
                    transition
                    hover:bg-slate-50
                  "
                >
                  <FiArrowLeft
                    size={18}
                  />
                </button>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF2FF] text-sm font-bold text-[#17357A]">

                  {selectedUser.name
                    ?.charAt(0)
                    .toUpperCase()}

                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedUser.name}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {selectedUser.role}
                    {selectedUser.employeeId
                      ? ` • ${selectedUser.employeeId}`
                      : ""}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={createNote}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#17357A]
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#21469E]
                "
              >
                <FiPlus size={17} />
                Add Checklist
              </button>

            </div>

          </div>

          {/* USER SCORE */}

          <UserScore
            notes={userNotes}
          />

          {/* NOTES */}

          <div className="bg-slate-50 p-5 sm:p-7">

            {userNotes.length === 0 ? (

              <div className="flex min-h-[360px] items-center justify-center">

                <div className="max-w-sm text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">

                    <FiCheckSquare
                      size={27}
                      className="text-slate-300"
                    />

                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-800">
                    No checklists yet
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Create a checklist to assign
                    tasks to {selectedUser.name}.
                  </p>

                  <button
                    type="button"
                    onClick={createNote}
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-[#17357A]
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    <FiPlus size={16} />
                    Create Checklist
                  </button>

                </div>

              </div>

            ) : (

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {userNotes.map(
                  (note) => (

                    <ChecklistCard
                      key={note.id}
                      note={note}
                      onOpen={() => {
                        setSelectedNote(
                          note
                        );
                        setShowNoteEditor(
                          true
                        );
                      }}
                      onDelete={() =>
                        deleteNote(
                          note.id
                        )
                      }
                    />

                  )
                )}

              </div>

            )}

          </div>

        </div>
      )}

      {/* EDITOR */}

      {showNoteEditor &&
        selectedNote && (
          <ChecklistEditor
            note={selectedNote}
            onClose={() => {
              setShowNoteEditor(
                false
              );
              setSelectedNote(
                null
              );
            }}
            onChange={
              updateNote
            }
            onDelete={() =>
              deleteNote(
                selectedNote.id
              )
            }
          />
        )}

    </div>
  );
};

export default UserChecklistWorkspace;

/* =========================================================
   SCORE
========================================================= */

interface UserScoreProps {
  notes: ChecklistNote[];
}

const UserScore = ({
  notes,
}: UserScoreProps) => {
  const allItems = notes.flatMap(
    (note) => note.items
  );

  const completed =
    allItems.filter(
      (item) => item.completed
    ).length;

  const total = allItems.length;

  const score =
    total === 0
      ? 0
      : Math.round(
          (completed / total) *
            100
        );

  return (
    <div className="grid grid-cols-2 gap-3 border-b border-slate-200 bg-white px-5 py-5 sm:grid-cols-4 sm:px-7">

      <ScoreCard
        label="Checklists"
        value={notes.length}
      />

      <ScoreCard
        label="Tasks"
        value={total}
      />

      <ScoreCard
        label="Completed"
        value={completed}
      />

      <ScoreCard
        label="Completion"
        value={`${score}%`}
        highlight
      />

    </div>
  );
};

interface ScoreCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

const ScoreCard = ({
  label,
  value,
  highlight,
}: ScoreCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-xl font-bold ${
          highlight
            ? "text-[#17357A]"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>

    </div>
  );
};

/* =========================================================
   CHECKLIST CARD
========================================================= */

interface ChecklistCardProps {
  note: ChecklistNote;
  onOpen: () => void;
  onDelete: () => void;
}

const ChecklistCard = ({
  note,
  onOpen,
  onDelete,
}: ChecklistCardProps) => {
  const total =
    note.items.length;

  const completed =
    note.items.filter(
      (item) => item.completed
    ).length;

  const percentage =
    total === 0
      ? 0
      : Math.round(
          (completed / total) *
            100
        );

  const priorityStyles = {
    Low: "bg-slate-100 text-slate-600",
    Medium:
      "bg-amber-50 text-amber-700",
    High:
      "bg-red-50 text-red-700",
  };

  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <h3 className="truncate font-semibold text-slate-900">
            {note.title ||
              "Untitled Checklist"}
          </h3>

          {note.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {note.description}
            </p>
          )}

        </div>

        <button
          type="button"
          onClick={onDelete}
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-slate-300
            opacity-0
            transition
            hover:bg-red-50
            hover:text-red-600
            group-hover:opacity-100
          "
        >
          <FiTrash2
            size={15}
          />
        </button>

      </div>

      <div className="mt-4 flex items-center gap-2">

        <span
          className={`
            rounded-full
            px-2.5
            py-1
            text-[11px]
            font-semibold
            ${priorityStyles[note.priority]}
          `}
        >
          {note.priority}
        </span>

        {note.dueDate && (
          <span className="flex items-center gap-1 text-xs text-slate-400">

            <FiCalendar
              size={12}
            />

            {new Date(
              note.dueDate
            ).toLocaleDateString(
              "en-IN"
            )}

          </span>
        )}

      </div>

      {/* Progress */}

      <div className="mt-5">

        <div className="flex items-center justify-between text-xs">

          <span className="font-medium text-slate-500">
            Progress
          </span>

          <span className="font-semibold text-slate-700">
            {completed}/{total}
          </span>

        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-[#17357A] transition-all"
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

      <button
        type="button"
        onClick={onOpen}
        className="
          mt-5
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-slate-200
          py-2.5
          text-sm
          font-semibold
          text-slate-700
          transition
          hover:bg-slate-50
        "
      >
        Open Checklist
        <FiChevronRight
          size={15}
        />
      </button>

    </div>
  );
};

/* =========================================================
   CHECKLIST EDITOR
========================================================= */

interface ChecklistEditorProps {
  note: ChecklistNote;
  onClose: () => void;
  onChange: (
    note: ChecklistNote
  ) => void;
  onDelete: () => void;
}

const ChecklistEditor = ({
  note,
  onClose,
  onChange,
  onDelete,
}: ChecklistEditorProps) => {
  const updateField = (
    field: keyof ChecklistNote,
    value: any
  ) => {
    onChange({
      ...note,
      [field]: value,
    });
  };

  const addItem = () => {
    onChange({
      ...note,
      items: [
        ...note.items,
        {
          id: `${Date.now()}`,
          text: "",
          completed: false,
        },
      ],
    });
  };

  const updateItem = (
    id: string,
    field: keyof ChecklistItem,
    value: any
  ) => {
    onChange({
      ...note,
      items: note.items.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                [field]: value,
              }
            : item
      ),
    });
  };

  const deleteItem = (
    id: string
  ) => {
    onChange({
      ...note,
      items: note.items.filter(
        (item) =>
          item.id !== id
      ),
    });
  };

  const completed =
    note.items.filter(
      (item) => item.completed
    ).length;

  const total =
    note.items.length;

  const percentage =
    total === 0
      ? 0
      : Math.round(
          (completed / total) *
            100
        );

  return (
    <div
      className="
        fixed
        inset-0
        z-[90]
        flex
        items-center
        justify-center
        bg-slate-950/50
        p-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >

      <div
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-2xl
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Checklist
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700">
              {percentage}% completed
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <FiX
              size={19}
            />
          </button>

        </div>

        {/* BODY */}

        <div className="overflow-y-auto p-6">

          {/* TITLE */}

          <input
            value={note.title}
            onChange={(event) =>
              updateField(
                "title",
                event.target.value
              )
            }
            placeholder="Checklist title"
            className="
              w-full
              border-0
              px-0
              text-2xl
              font-bold
              text-slate-900
              outline-none
              placeholder:text-slate-300
            "
          />

          {/* DESCRIPTION */}

          <textarea
            value={note.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            placeholder="Add a description..."
            rows={2}
            className="
              mt-3
              w-full
              resize-none
              border-0
              px-0
              text-sm
              text-slate-600
              outline-none
              placeholder:text-slate-300
            "
          />

          {/* OPTIONS */}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <div>

              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Priority
              </label>

              <select
                value={
                  note.priority
                }
                onChange={(event) =>
                  updateField(
                    "priority",
                    event.target.value
                  )
                }
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  text-sm
                  outline-none
                "
              >
                <option>
                  Low
                </option>

                <option>
                  Medium
                </option>

                <option>
                  High
                </option>

              </select>

            </div>

            <div>

              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Due Date
              </label>

              <input
                type="date"
                value={
                  note.dueDate
                }
                onChange={(event) =>
                  updateField(
                    "dueDate",
                    event.target.value
                  )
                }
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  text-sm
                  outline-none
                "
              />

            </div>

          </div>

          {/* CHECKLIST */}

          <div className="mt-7">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-semibold text-slate-900">
                  Checklist
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {completed} of {total} completed
                </p>

              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#17357A]">
                {percentage}%
              </span>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-[#17357A] transition-all"
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>

            <div className="mt-5 space-y-2">

              {note.items.map(
                (item) => (

                  <div
                    key={item.id}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      py-2.5
                    "
                  >

                    <button
                      type="button"
                      onClick={() =>
                        updateItem(
                          item.id,
                          "completed",
                          !item.completed
                        )
                      }
                      className={`
                        flex
                        h-5
                        w-5
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        border
                        transition
                        ${
                          item.completed
                            ? "border-[#17357A] bg-[#17357A] text-white"
                            : "border-slate-300 bg-white"
                        }
                      `}
                    >
                      {item.completed && (
                        <FiCheck
                          size={13}
                        />
                      )}
                    </button>

                    <input
                      value={
                        item.text
                      }
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "text",
                          event.target
                            .value
                        )
                      }
                      placeholder="Add a task..."
                      className={`
                        min-w-0
                        flex-1
                        border-0
                        bg-transparent
                        text-sm
                        outline-none
                        ${
                          item.completed
                            ? "text-slate-400 line-through"
                            : "text-slate-700"
                        }
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        deleteItem(
                          item.id
                        )
                      }
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        text-slate-300
                        transition
                        hover:bg-red-50
                        hover:text-red-500
                      "
                    >
                      <FiTrash2
                        size={14}
                      />
                    </button>

                  </div>

                )
              )}

            </div>

            <button
              type="button"
              onClick={addItem}
              className="
                mt-3
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-dashed
                border-slate-300
                py-3
                text-sm
                font-semibold
                text-slate-500
                transition
                hover:border-[#17357A]
                hover:bg-blue-50
                hover:text-[#17357A]
              "
            >
              <FiPlus
                size={16}
              />
              Add checklist item
            </button>

          </div>

          {/* REMARKS */}

          <div className="mt-7">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Remarks
            </label>

            <textarea
              value={note.remarks}
              onChange={(event) =>
                updateField(
                  "remarks",
                  event.target.value
                )
              }
              rows={3}
              placeholder="Additional instructions or remarks..."
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
                text-sm
                outline-none
                focus:border-[#17357A]
                focus:bg-white
              "
            />

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">

          <button
            type="button"
            onClick={onDelete}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              px-3
              py-2
              text-sm
              font-medium
              text-red-500
              transition
              hover:bg-red-50
            "
          >
            <FiTrash2
              size={15}
            />
            Delete
          </button>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              bg-[#17357A]
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#21469E]
            "
          >
            Done
          </button>

        </div>

      </div>

    </div>
  );
};