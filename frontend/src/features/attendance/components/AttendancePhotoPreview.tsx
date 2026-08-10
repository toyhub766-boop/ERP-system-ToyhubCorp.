import { useEffect } from "react";
import {
  FiCalendar,
  FiCamera,
  FiX,
} from "react-icons/fi";

interface Props {
  open: boolean;
  photo: string;
  employeeName: string;
  date?: string;
  onClose: () => void;
}

const formatDate = (value?: string) => {
  if (!value) return "";

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const AttendancePhotoPreview = ({
  open,
  photo,
  employeeName,
  date,
  onClose,
}: Props) => {
  /*
   * Close with Escape
   */

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
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
  }, [open, onClose]);

  /*
   * Prevent rendering when closed
   */

  if (!open || !photo) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/75
        p-4
        backdrop-blur-sm
        animate-in
        fade-in
        duration-200
      "
      onClick={onClose}
    >

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Attendance photo preview"
        className="
          relative
          flex
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
          animate-in
          zoom-in-95
          duration-200
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* ================= HEADER ================= */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#17357A]">
              <FiCamera size={17} />
            </div>

            <div>

              <p className="text-sm font-semibold text-slate-900">
                Attendance Photo
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {employeeName}
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
            aria-label="Close photo preview"
          >
            <FiX size={19} />
          </button>

        </div>

        {/* ================= IMAGE ================= */}

        <div className="flex max-h-[70vh] min-h-[280px] items-center justify-center bg-slate-100 p-4 sm:p-6">

          <img
            src={photo}
            alt={`${employeeName} attendance`}
            className="
              max-h-[62vh]
              max-w-full
              rounded-xl
              object-contain
              shadow-lg
            "
          />

        </div>

        {/* ================= FOOTER ================= */}

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm font-semibold text-slate-900">
              {employeeName}
            </p>

            {date && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">

                <FiCalendar size={13} />

                {formatDate(date)}

              </p>
            )}

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              rounded-xl
              bg-[#172B6B]
              px-5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#20398F]
              active:scale-[0.98]
            "
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
};

export default AttendancePhotoPreview;