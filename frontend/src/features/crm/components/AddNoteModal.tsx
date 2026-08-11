import { useEffect, useState } from "react";
import {
  X,
  CalendarDays,
  Check,
  ClipboardList,
  FileText,
  Flag,
  MessageSquare,
  Package,
  CreditCard,
  Users,
  AlertCircle,
} from "lucide-react";

import { addCustomerNote } from "../services/customerNote.service";


interface Props {
  open: boolean;
  customerId: string;
  onClose: () => void;
  onSuccess: () => void;
}


type NoteForm = {
  title: string;
  note: string;

  type:
    | "GENERAL"
    | "PAYMENT"
    | "MEETING"
    | "FOLLOW_UP"
    | "COMPLAINT"
    | "PRODUCT";

  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  reminderDate: string;

  completed: boolean;
};


const emptyForm: NoteForm = {
  title: "",
  note: "",
  type: "GENERAL",
  priority: "MEDIUM",
  reminderDate: "",
  completed: false,
};


const activityTypes = [
  {
    value: "GENERAL",
    label: "General",
    description: "General customer activity",
    icon: ClipboardList,
  },
  {
    value: "MEETING",
    label: "Meeting",
    description: "Customer meeting or discussion",
    icon: Users,
  },
  {
    value: "FOLLOW_UP",
    label: "Follow Up",
    description: "Future customer follow-up",
    icon: MessageSquare,
  },
  {
    value: "PAYMENT",
    label: "Payment",
    description: "Payment-related activity",
    icon: CreditCard,
  },
  {
    value: "PRODUCT",
    label: "Product",
    description: "Product-related discussion",
    icon: Package,
  },
  {
    value: "COMPLAINT",
    label: "Complaint",
    description: "Customer complaint or issue",
    icon: AlertCircle,
  },
] as const;


const AddNoteModal = ({
  open,
  customerId,
  onClose,
  onSuccess,
}: Props) => {

  const [form, setForm] =
    useState<NoteForm>(emptyForm);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     RESET
  ========================================================= */

  useEffect(() => {
    if (!open) return;

    setForm({
      ...emptyForm,
    });

    setError("");
    setIsSaving(false);

  }, [open]);


  /* =========================================================
     ESCAPE
  ========================================================= */

  useEffect(() => {

    if (!open) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {

      if (
        event.key === "Escape" &&
        !isSaving
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

  }, [open, isSaving, onClose]);


  if (!open) {
    return null;
  }


  /* =========================================================
     CHANGE
  ========================================================= */

  const handleChange = (
    event:
      React.ChangeEvent<
        HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
      >
  ) => {

    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };


  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    if (!form.title.trim()) {
      setError(
        "Please enter an activity title."
      );
      return;
    }

    if (!form.note.trim()) {
      setError(
        "Please enter the activity notes."
      );
      return;
    }

    try {

      setIsSaving(true);
      setError("");

      await addCustomerNote(
        customerId,
        {
          ...form,
          title: form.title.trim(),
          note: form.note.trim(),
        }
      );

      setForm({
        ...emptyForm,
      });

      onSuccess();
      onClose();

    } catch (err) {

      console.error(err);

      setError(
        "Unable to save this activity. Please try again."
      );

    } finally {

      setIsSaving(false);

    }
  };


  const selectedActivity =
    activityTypes.find(
      (item) =>
        item.value === form.type
    );


  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/55
        p-4
        backdrop-blur-[3px]
        animate-in
        fade-in
        duration-200
      "
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget &&
          !isSaving
        ) {
          onClose();
        }

      }}
    >

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-crm-activity-title"
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-white/70
          bg-white
          shadow-[0_30px_90px_rgba(15,23,42,0.24)]
          animate-in
          zoom-in-95
          slide-in-from-bottom-2
          duration-200
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            flex
            shrink-0
            items-start
            justify-between
            border-b
            border-slate-100
            bg-white
            px-6
            py-5
            sm:px-7
          "
        >

          <div
            className="
              flex
              items-start
              gap-3
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
                rounded-2xl
                bg-blue-50
                text-[#172B6B]
              "
            >
              <ClipboardList
                size={20}
              />
            </div>


            <div>

              <h2
                id="add-crm-activity-title"
                className="
                  text-lg
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-xl
                "
              >
                Add CRM Activity
              </h2>

              <p
                className="
                  mt-1
                  max-w-md
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Record a meeting, follow-up,
                payment, complaint or customer note.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition-all
              hover:bg-slate-100
              hover:text-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Close"
          >
            <X size={19} />
          </button>

        </div>


        {/* =====================================================
            BODY
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            min-h-0
            flex-1
            overflow-y-auto
          "
        >

          <div
            className="
              space-y-6
              px-6
              py-6
              sm:px-7
            "
          >

            {/* =================================================
                ACTIVITY TYPE
            ================================================= */}

            <div>

              <div className="mb-3">

                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  Activity Type
                </label>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  What kind of customer activity
                  are you recording?
                </p>

              </div>


              <div
                className="
                  grid
                  grid-cols-2
                  gap-2
                  sm:grid-cols-3
                "
              >

                {activityTypes.map(
                  (activity) => {

                    const Icon =
                      activity.icon;

                    const active =
                      form.type ===
                      activity.value;

                    return (
                      <button
                        key={
                          activity.value
                        }
                        type="button"
                        onClick={() =>
                          setForm(
                            (prev) => ({
                              ...prev,
                              type: activity.value,
                            })
                          )
                        }
                        className={`
                          group
                          rounded-2xl
                          border
                          p-3
                          text-left
                          transition-all
                          duration-200
                          ${
                            active
                              ? "border-[#172B6B]/30 bg-blue-50/70 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-2
                          "
                        >

                          <div
                            className={`
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-xl
                              ${
                                active
                                  ? "bg-[#172B6B] text-white"
                                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                              }
                            `}
                          >
                            <Icon
                              size={15}
                            />
                          </div>


                          {active && (
                            <div
                              className="
                                flex
                                h-5
                                w-5
                                items-center
                                justify-center
                                rounded-full
                                bg-[#172B6B]
                                text-white
                              "
                            >
                              <Check
                                size={12}
                                strokeWidth={3}
                              />
                            </div>
                          )}

                        </div>


                        <p
                          className="
                            mt-3
                            text-xs
                            font-bold
                            text-slate-800
                          "
                        >
                          {activity.label}
                        </p>

                        <p
                          className="
                            mt-1
                            line-clamp-2
                            text-[10px]
                            leading-4
                            text-slate-400
                          "
                        >
                          {activity.description}
                        </p>

                      </button>
                    );

                  }
                )}

              </div>

            </div>


            {/* =================================================
                PRIORITY
            ================================================= */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >
                Priority
              </label>


              <div
                className="
                  grid
                  grid-cols-3
                  gap-2
                "
              >

                {[
                  {
                    value: "LOW",
                    label: "Low",
                    className:
                      "emerald",
                  },
                  {
                    value: "MEDIUM",
                    label: "Medium",
                    className:
                      "amber",
                  },
                  {
                    value: "HIGH",
                    label: "High",
                    className:
                      "red",
                  },
                ].map((priority) => {

                  const active =
                    form.priority ===
                    priority.value;

                  return (
                    <button
                      key={
                        priority.value
                      }
                      type="button"
                      onClick={() =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            priority:
                              priority.value as NoteForm["priority"],
                          })
                        )
                      }
                      className={`
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-xs
                        font-semibold
                        transition-all
                        ${
                          active
                            ? priority.className ===
                              "emerald"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : priority.className ===
                                "amber"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-red-200 bg-red-50 text-red-700"
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }
                      `}
                    >
                      <Flag
                        size={13}
                      />

                      {priority.label}

                    </button>
                  );

                })}

              </div>

            </div>


            {/* =================================================
                TITLE
            ================================================= */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >
                Activity Title
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Meeting regarding Diwali collection"
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  text-slate-800
                  outline-none
                  transition-all
                  placeholder:text-slate-400
                  focus:border-[#172B6B]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-50
                "
              />

            </div>


            {/* =================================================
                NOTES
            ================================================= */}

            <div>

              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                "
              >

                <label
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  Activity Notes
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <span
                  className="
                    text-[10px]
                    text-slate-400
                  "
                >
                  {form.note.length}
                  {" "}
                  characters
                </span>

              </div>


              <div className="relative">

                <FileText
                  size={16}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-4
                    text-slate-400
                  "
                />

                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write everything discussed with the customer..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    py-3.5
                    pl-11
                    pr-4
                    text-sm
                    leading-6
                    text-slate-800
                    outline-none
                    transition-all
                    placeholder:text-slate-400
                    focus:border-[#172B6B]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-50
                  "
                />

              </div>

            </div>


            {/* =================================================
                REMINDER
            ================================================= */}

            <div
              className="
                rounded-2xl
                border
                border-slate-200
                bg-slate-50/70
                p-4
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-4
                  sm:flex-row
                  sm:items-end
                "
              >

                <div className="flex-1">

                  <label
                    className="
                      mb-2
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-semibold
                      text-slate-800
                    "
                  >
                    <CalendarDays
                      size={15}
                      className="text-slate-500"
                    />

                    Reminder Date

                  </label>

                  <input
                    type="date"
                    name="reminderDate"
                    value={
                      form.reminderDate
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      text-sm
                      text-slate-700
                      outline-none
                      transition
                      focus:border-[#172B6B]
                      focus:ring-4
                      focus:ring-blue-50
                    "
                  />

                </div>


                <div
                  className="
                    flex
                    h-11
                    items-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-3
                  "
                >

                  <label
                    className="
                      flex
                      cursor-pointer
                      items-center
                      gap-2.5
                    "
                  >

                    <input
                      type="checkbox"
                      checked={
                        form.completed
                      }
                      onChange={(e) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            completed:
                              e.target.checked,
                          })
                        )
                      }
                      className="
                        h-4
                        w-4
                        rounded
                        border-slate-300
                        text-[#172B6B]
                        accent-[#172B6B]
                      "
                    />

                    <span
                      className="
                        text-xs
                        font-semibold
                        text-slate-700
                      "
                    >
                      Mark as completed
                    </span>

                  </label>

                </div>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div
                className="
                  flex
                  items-start
                  gap-2.5
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
              >

                <AlertCircle
                  size={16}
                  className="
                    mt-0.5
                    shrink-0
                  "
                />

                <span>
                  {error}
                </span>

              </div>

            )}

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              flex-col-reverse
              gap-2
              border-t
              border-slate-100
              bg-slate-50/70
              px-6
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-7
            "
          >

            <div
              className="
                hidden
                items-center
                gap-2
                text-[11px]
                text-slate-400
                sm:flex
              "
            >
              {selectedActivity && (
                <>
                  <selectedActivity.icon
                    size={13}
                  />

                  {selectedActivity.label}
                </>
              )}
            </div>


            <div
              className="
                flex
                flex-col-reverse
                gap-2
                sm:flex-row
              "
            >

              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="
                  h-10
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={
                  isSaving ||
                  !form.title.trim() ||
                  !form.note.trim()
                }
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#172B6B]
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-[#20398F]
                  hover:shadow-md
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {isSaving ? (

                  <>
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                      "
                    />

                    Saving...
                  </>

                ) : (

                  <>
                    <Check
                      size={15}
                      strokeWidth={2.5}
                    />

                    Save Activity
                  </>

                )}

              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
};


export default AddNoteModal;