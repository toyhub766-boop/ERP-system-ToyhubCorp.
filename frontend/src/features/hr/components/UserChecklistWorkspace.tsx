import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiCheckSquare,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiPlus,
  FiSearch,
  FiTarget,
  FiTrash2,
  FiUsers,
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

  // IMPORTANT:
  // Associates the checklist with a specific employee.
  userId: string;

  title: string;
  description: string;

  priority:
    | "Low"
    | "Medium"
    | "High";

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

  /*
   * =========================================================
   * USER SEARCH
   * =========================================================
   */

  const filteredUsers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      `${user.name} ${
        user.role
      } ${
        user.employeeId || ""
      }`
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  /*
   * =========================================================
   * SELECTED USER NOTES
   *
   * FIX:
   * Previously every user received every checklist.
   *
   * Now every checklist contains userId and is filtered
   * against the selected employee.
   * =========================================================
   */

  const userNotes = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    return notes.filter(
      (note) =>
        note.userId ===
        selectedUser._id
    );
  }, [notes, selectedUser]);

  /*
   * =========================================================
   * CREATE CHECKLIST
   * =========================================================
   */

  const createNote = () => {
    if (!selectedUser) {
      return;
    }

    const timestamp =
      Date.now().toString();

    const newNote: ChecklistNote = {
      id: timestamp,

      userId:
        selectedUser._id,

      title: "",
      description: "",

      priority: "Medium",

      dueDate: "",
      remarks: "",

      items: [
        {
          id: `${timestamp}-1`,
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

  /*
   * =========================================================
   * UPDATE
   * =========================================================
   */

  const updateNote = (
    updatedNote: ChecklistNote
  ) => {
    setNotes((previous) =>
      previous.map((note) =>
        note.id ===
        updatedNote.id
          ? updatedNote
          : note
      )
    );

    setSelectedNote(
      updatedNote
    );
  };

  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  const deleteNote = (
    noteId: string
  ) => {
    setNotes((previous) =>
      previous.filter(
        (note) =>
          note.id !== noteId
      )
    );

    if (
      selectedNote?.id ===
      noteId
    ) {
      setSelectedNote(null);
      setShowNoteEditor(false);
    }
  };

  /*
   * =========================================================
   * SELECT USER
   * =========================================================
   */

  const handleSelectUser = (
    user: User
  ) => {
    setSelectedUser(user);
    setSelectedNote(null);
    setShowNoteEditor(false);
  };

  /*
   * =========================================================
   * CLOSE WORKSPACE
   * =========================================================
   */

  const handleBack = () => {
    setSelectedUser(null);
    setSelectedNote(null);
    setShowNoteEditor(false);
  };

  return (
    <div
      className="
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200
        bg-white
        shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]
      "
    >
      {!selectedUser ? (
        /*
         * =====================================================
         * USER SELECTOR
         * =====================================================
         */

        <div className="flex min-h-[680px]">

          {/* LEFT USER PANEL */}

          <div
            className="
              flex
              w-full
              flex-col
              border-r
              border-slate-200
              lg:w-[370px]
            "
          >
            {/* HEADER */}

            <div
              className="
                border-b
                border-slate-200
                px-6
                py-6
              "
            >
              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#EEF2FF]
                      text-[#17357A]
                    "
                  >
                    <FiCheckSquare
                      size={21}
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      User Checklists
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Employee task management
                    </p>
                  </div>

                </div>

                <div
                  className="
                    hidden
                    rounded-full
                    bg-slate-100
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-slate-500
                    sm:block
                  "
                >
                  {users.length}
                </div>

              </div>

              {/* SEARCH */}

              <div className="relative mt-6">

                <FiSearch
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                  size={17}
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search employees..."
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-10
                    pr-10
                    text-sm
                    text-slate-800
                    outline-none
                    transition-all
                    placeholder:text-slate-400
                    focus:border-[#17357A]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-50
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      flex
                      h-6
                      w-6
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      transition
                      hover:bg-slate-100
                      hover:text-slate-700
                    "
                  >
                    <FiX
                      size={14}
                    />
                  </button>
                )}

              </div>

              <div className="mt-4 flex items-center justify-between">

                <p className="text-xs font-medium text-slate-400">
                  {filteredUsers.length} employee
                  {filteredUsers.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <FiUsers size={13} />
                  Team
                </div>

              </div>
            </div>

            {/* USER LIST */}

            <div
              className="
                flex-1
                overflow-y-auto
                p-3
              "
            >
              {filteredUsers.length ===
              0 ? (
                <div className="flex min-h-[360px] items-center justify-center px-6">

                  <div className="max-w-[230px] text-center">

                    <div
                      className="
                        mx-auto
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-slate-100
                        text-slate-400
                      "
                    >
                      <FiSearch
                        size={22}
                      />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-800">
                      No employees found
                    </h3>

                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      Try searching by name,
                      role or employee ID.
                    </p>

                  </div>

                </div>
              ) : (
                <div className="space-y-1">

                  {filteredUsers.map(
                    (user) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() =>
                          handleSelectUser(
                            user
                          )
                        }
                        className="
                          group
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          border-transparent
                          px-3
                          py-3
                          text-left
                          transition-all
                          duration-200
                          hover:border-slate-200
                          hover:bg-slate-50
                        "
                      >

                        <div
                          className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            from-[#17357A]
                            to-[#3157B7]
                            text-sm
                            font-bold
                            text-white
                            shadow-sm
                          "
                        >
                          {user.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {user.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {user.role}
                            {user.employeeId
                              ? ` • ${user.employeeId}`
                              : ""}
                          </p>

                        </div>

                        <FiChevronRight
                          size={16}
                          className="
                            text-slate-300
                            transition
                            group-hover:translate-x-0.5
                            group-hover:text-[#17357A]
                          "
                        />

                      </button>
                    )
                  )}

                </div>
              )}
            </div>
          </div>

          {/* EMPTY STATE */}

          <div
            className="
              hidden
              flex-1
              items-center
              justify-center
              bg-[radial-gradient(circle_at_top,#f8faff,transparent_60%)]
              lg:flex
            "
          >
            <div className="max-w-sm px-8 text-center">

              <div
                className="
                  mx-auto
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-[26px]
                  border
                  border-slate-200
                  bg-white
                  text-[#17357A]
                  shadow-sm
                "
              >
                <FiUsers
                  size={29}
                />
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
                Select an employee
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose an employee from the
                team directory to view their
                checklists, assign tasks and
                monitor completion.
              </p>

              <div
                className="
                  mx-auto
                  mt-6
                  flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2
                  text-xs
                  font-medium
                  text-slate-500
                "
              >
                <FiTarget
                  size={13}
                />
                Task management workspace
              </div>

            </div>
          </div>

        </div>
      ) : (
        /*
         * =====================================================
         * SELECTED USER WORKSPACE
         * =====================================================
         */

        <div className="min-h-[680px]">

          {/* HEADER */}

          <div
            className="
              border-b
              border-slate-200
              bg-white
              px-5
              py-5
              sm:px-7
            "
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 items-center gap-3">

                <button
                  type="button"
                  onClick={handleBack}
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    text-slate-500
                    transition
                    hover:bg-slate-50
                    hover:text-slate-800
                  "
                >
                  <FiArrowLeft
                    size={18}
                  />
                </button>

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#EEF2FF]
                    text-sm
                    font-bold
                    text-[#17357A]
                  "
                >
                  {selectedUser.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">
                      {selectedUser.name}
                    </h2>

                    <span
                      className="
                        hidden
                        rounded-full
                        bg-emerald-50
                        px-2
                        py-0.5
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-emerald-600
                        sm:inline-flex
                      "
                    >
                      Employee
                    </span>

                  </div>

                  <p className="truncate text-sm text-slate-500">
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
                  shadow-md
                  shadow-[#17357A]/15
                  transition-all
                  duration-200
                  hover:bg-[#21469E]
                  hover:shadow-lg
                  active:scale-[0.98]
                "
              >
                <FiPlus
                  size={17}
                />
                Add Checklist
              </button>

            </div>
          </div>

          {/* SCORE */}

          <UserScore
            notes={userNotes}
          />

          {/* CONTENT */}

          <div
            className="
              min-h-[500px]
              bg-[#F7F8FC]
              p-5
              sm:p-7
            "
          >

            {userNotes.length ===
            0 ? (
              <div
                className="
                  flex
                  min-h-[430px]
                  items-center
                  justify-center
                "
              >
                <div className="max-w-sm text-center">

                  <div
                    className="
                      mx-auto
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-3xl
                      bg-white
                      text-[#17357A]
                      shadow-sm
                    "
                  >
                    <FiCheckSquare
                      size={27}
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    No checklists yet
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Create a checklist to
                    assign tasks and track
                    {selectedUser.name}'s
                    progress.
                  </p>

                  <button
                    type="button"
                    onClick={createNote}
                    className="
                      mt-6
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-[#17357A]
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-[#21469E]
                    "
                  >
                    <FiPlus
                      size={16}
                    />
                    Create Checklist
                  </button>

                </div>
              </div>
            ) : (
              <div
                className="
                  grid
                  gap-5
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
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

      {/* =======================================================
          EDITOR
      ======================================================= */}

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
   USER SCORE
========================================================= */

interface UserScoreProps {
  notes: ChecklistNote[];
}

const UserScore = ({
  notes,
}: UserScoreProps) => {
  const allItems =
    notes.flatMap(
      (note) => note.items
    );

  const completed =
    allItems.filter(
      (item) =>
        item.completed
    ).length;

  const total =
    allItems.length;

  const score =
    total === 0
      ? 0
      : Math.round(
          (completed /
            total) *
            100
        );

  const pending =
    Math.max(
      total - completed,
      0
    );

  return (
    <div
      className="
        grid
        grid-cols-2
        border-b
        border-slate-200
        bg-white
        sm:grid-cols-4
      "
    >
      <ScoreCard
        label="Checklists"
        value={notes.length}
        icon={<FiCheckSquare />}
      />

      <ScoreCard
        label="Total Tasks"
        value={total}
        icon={<FiTarget />}
      />

      <ScoreCard
        label="Pending"
        value={pending}
        icon={<FiClock />}
      />

      <ScoreCard
        label="Completion"
        value={`${score}%`}
        icon={<FiCheck />}
        highlight
      />
    </div>
  );
};

interface ScoreCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
}

const ScoreCard = ({
  label,
  value,
  icon,
  highlight,
}: ScoreCardProps) => {
  return (
    <div
      className="
        border-r
        border-slate-100
        px-5
        py-5
        last:border-r-0
        sm:px-7
      "
    >
      <div className="flex items-center gap-3">

        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            ${
              highlight
                ? "bg-blue-50 text-[#17357A]"
                : "bg-slate-50 text-slate-400"
            }
          `}
        >
          {icon}
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p
            className={`
              mt-0.5
              text-xl
              font-bold
              tracking-tight
              ${
                highlight
                  ? "text-[#17357A]"
                  : "text-slate-900"
              }
            `}
          >
            {value}
          </p>
        </div>

      </div>
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
      (item) =>
        item.completed
    ).length;

  const percentage =
    total === 0
      ? 0
      : Math.round(
          (completed /
            total) *
            100
        );

  const priorityStyles = {
    Low: {
      badge:
        "bg-slate-100 text-slate-600",
      dot: "bg-slate-400",
    },

    Medium: {
      badge:
        "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },

    High: {
      badge:
        "bg-red-50 text-red-700",
      dot: "bg-red-500",
    },
  };

  const priority =
    priorityStyles[
      note.priority
    ];

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
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-lg
      "
    >

      {/* TOP */}

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <span
              className={`
                h-2
                w-2
                rounded-full
                ${priority.dot}
              `}
            />

            <span
              className={`
                rounded-full
                px-2
                py-1
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                ${priority.badge}
              `}
            >
              {note.priority}
            </span>

          </div>

          <h3 className="mt-3 truncate text-base font-bold text-slate-900">
            {note.title ||
              "Untitled Checklist"}
          </h3>

          {note.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
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
            transition-all
            group-hover:opacity-100
            hover:bg-red-50
            hover:text-red-600
          "
          aria-label="Delete checklist"
        >
          <FiTrash2
            size={15}
          />
        </button>

      </div>

      {/* META */}

      <div className="mt-4 flex items-center gap-3">

        {note.dueDate && (
          <span
            className="
              flex
              items-center
              gap-1.5
              text-xs
              font-medium
              text-slate-400
            "
          >
            <FiCalendar
              size={12}
            />

            {new Date(
              note.dueDate
            ).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
              }
            )}
          </span>
        )}

        <span className="text-xs text-slate-300">
          •
        </span>

        <span className="text-xs font-medium text-slate-400">
          {total} task
          {total !== 1
            ? "s"
            : ""}
        </span>

      </div>

      {/* PROGRESS */}

      <div className="mt-5">

        <div className="flex items-center justify-between">

          <span className="text-xs font-semibold text-slate-500">
            Progress
          </span>

          <span className="text-xs font-bold text-slate-700">
            {percentage}%
          </span>

        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

          <div
            className="
              h-full
              rounded-full
              bg-[#17357A]
              transition-all
              duration-500
            "
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

      {/* ACTION */}

      <button
        type="button"
        onClick={onOpen}
        className="
          mt-5
          flex
          w-full
          items-center
          justify-between
          rounded-xl
          border
          border-slate-200
          px-4
          py-2.5
          text-sm
          font-semibold
          text-slate-700
          transition-all
          hover:border-[#17357A]/20
          hover:bg-blue-50
          hover:text-[#17357A]
        "
      >
        <span className="flex items-center gap-2">
          <FiEdit3 size={14} />
          Open Checklist
        </span>

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
  /*
   * Escape support
   */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  const updateField = (
    field: keyof ChecklistNote,
    value: unknown
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
    value: unknown
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
      (item) =>
        item.completed
    ).length;

  const total =
    note.items.length;

  const percentage =
    total === 0
      ? 0
      : Math.round(
          (completed /
            total) *
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
        bg-slate-950/55
        p-3
        backdrop-blur-md
        sm:p-5
      "
      onClick={onClose}
    >
      <div
        className="
          flex
          max-h-[94vh]
          w-full
          max-w-[700px]
          flex-col
          overflow-hidden
          rounded-[26px]
          border
          border-white/20
          bg-white
          shadow-[0_30px_100px_-30px_rgba(0,0,0,0.45)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-5
            py-4
            sm:px-6
          "
        >
          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-[#EEF2FF]
                text-[#17357A]
              "
            >
              <FiCheckSquare
                size={18}
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Checklist Editor
              </p>

              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {percentage}% complete
              </p>
            </div>

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
            aria-label="Close"
          >
            <FiX
              size={19}
            />
          </button>

        </div>

        {/* BODY */}

        <div
          className="
            overflow-y-auto
            px-5
            py-6
            sm:px-7
          "
        >

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
            autoFocus
            className="
              w-full
              border-0
              bg-transparent
              px-0
              text-2xl
              font-bold
              tracking-tight
              text-slate-900
              outline-none
              placeholder:text-slate-300
              sm:text-3xl
            "
          />

          <textarea
            value={
              note.description
            }
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            placeholder="Add a short description..."
            rows={2}
            className="
              mt-3
              w-full
              resize-none
              border-0
              bg-transparent
              px-0
              text-sm
              leading-6
              text-slate-600
              outline-none
              placeholder:text-slate-300
            "
          />

          {/* OPTIONS */}

          <div
            className="
              mt-6
              grid
              gap-3
              sm:grid-cols-2
            "
          >
            <div>

              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
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
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition
                  focus:border-[#17357A]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-50
                "
              >
                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>
              </select>

            </div>

            <div>

              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
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
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition
                  focus:border-[#17357A]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-50
                "
              />

            </div>
          </div>

          {/* PROGRESS */}

          <div
            className="
              mt-7
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              p-4
            "
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Task Progress
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {completed} of{" "}
                  {total} tasks
                  completed
                </p>
              </div>

              <span
                className="
                  rounded-full
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-[#17357A]
                  shadow-sm
                "
              >
                {percentage}%
              </span>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

              <div
                className="
                  h-full
                  rounded-full
                  bg-[#17357A]
                  transition-all
                  duration-500
                "
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>
          </div>

          {/* CHECKLIST */}

          <div className="mt-7">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tasks
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Add actionable items for
                  this employee.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-xl
                  bg-blue-50
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-[#17357A]
                  transition
                  hover:bg-blue-100
                "
              >
                <FiPlus
                  size={14}
                />
                Add Task
              </button>

            </div>

            <div className="mt-4 space-y-2">

              {note.items.length ===
                0 && (
                <div
                  className="
                    rounded-xl
                    border
                    border-dashed
                    border-slate-300
                    px-5
                    py-8
                    text-center
                  "
                >
                  <p className="text-sm font-medium text-slate-500">
                    No tasks added yet.
                  </p>
                </div>
              )}

              {note.items.map(
                (item, index) => (
                  <div
                    key={item.id}
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      py-2.5
                      transition
                      focus-within:border-[#17357A]/30
                      focus-within:ring-4
                      focus-within:ring-blue-50
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
                        transition-all
                        ${
                          item.completed
                            ? "border-[#17357A] bg-[#17357A] text-white"
                            : "border-slate-300 bg-white hover:border-[#17357A]"
                        }
                      `}
                      aria-label={
                        item.completed
                          ? "Mark incomplete"
                          : "Mark complete"
                      }
                    >
                      {item.completed && (
                        <FiCheck
                          size={13}
                        />
                      )}
                    </button>

                    <span className="w-5 shrink-0 text-[10px] font-bold text-slate-300">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

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
                        opacity-0
                        transition
                        group-hover:opacity-100
                        hover:bg-red-50
                        hover:text-red-500
                      "
                      aria-label="Delete task"
                    >
                      <FiTrash2
                        size={14}
                      />
                    </button>

                  </div>
                )
              )}

            </div>

          </div>

          {/* REMARKS */}

          <div className="mt-7">

            <label className="mb-2 block text-sm font-bold text-slate-800">
              Remarks
            </label>

            <textarea
              value={
                note.remarks
              }
              onChange={(event) =>
                updateField(
                  "remarks",
                  event.target.value
                )
              }
              rows={3}
              placeholder="Add instructions, context or additional remarks..."
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
                leading-6
                text-slate-700
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[#17357A]
                focus:bg-white
                focus:ring-4
                focus:ring-blue-50
              "
            />

          </div>

        </div>

        {/* FOOTER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-slate-200
            bg-white
            px-5
            py-4
            sm:px-6
          "
        >

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
              font-semibold
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
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[#17357A]
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              hover:bg-[#21469E]
              hover:shadow-md
              active:scale-[0.98]
            "
          >
            <FiCheck
              size={16}
            />
            Done
          </button>

        </div>

      </div>
    </div>
  );
};