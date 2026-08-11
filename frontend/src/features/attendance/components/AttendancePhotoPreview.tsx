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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AttendancePhotoPreview = ({
  open,
  photo,
  employeeName,
  date,
  onClose,
}: Props) => {
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

  if (!open || !photo) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-slate-950/70
        p-3
        backdrop-blur-md
        sm:p-6
      "
      onClick={onClose}
    >

      {/* Modal */}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Attendance photo preview"
        onClick={(event) =>
          event.stopPropagation()
        }
        className="
          relative
          flex
          w-full
          max-w-4xl
          flex-col
          overflow-hidden
          rounded-[28px]
          border
          border-white/10
          bg-white
          shadow-[0_30px_100px_rgba(0,0,0,0.35)]
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >

        {/* ================= HEADER ================= */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-100
            bg-white
            px-5
            py-4
            sm:px-6
          "
        >

          <div className="flex min-w-0 items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#17357A]/10
                text-[#17357A]
              "
            >
              <FiCamera size={18} />
            </div>

            <div className="min-w-0">

              <p className="text-sm font-bold text-slate-900">
                Attendance Photo
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {employeeName}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo preview"
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
              duration-200
              hover:bg-slate-100
              hover:text-slate-700
              active:scale-95
            "
          >
            <FiX size={19} />
          </button>

        </div>

        {/* ================= IMAGE AREA ================= */}

        <div
          className="
            relative
            flex
            min-h-[300px]
            max-h-[72vh]
            items-center
            justify-center
            overflow-hidden
            bg-[#0F172A]
            p-4
            sm:min-h-[420px]
            sm:p-8
          "
        >

          {/* subtle background */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-30
              [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0,transparent_60%)]
            "
          />

          <img
            src={photo}
            alt={`${employeeName} attendance`}
            className="
              relative
              z-10
              max-h-[65vh]
              max-w-full
              rounded-2xl
              object-contain
              shadow-[0_20px_60px_rgba(0,0,0,0.35)]
            "
          />

        </div>

        {/* ================= FOOTER ================= */}

        <div
          className="
            flex
            shrink-0
            flex-col
            gap-4
            border-t
            border-slate-100
            bg-white
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
          "
        >

          <div className="min-w-0">

            <p className="truncate text-sm font-bold text-slate-900">
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
              w-full
              items-center
              justify-center
              rounded-xl
              bg-[#17357A]
              px-6
              text-sm
              font-semibold
              text-white
              shadow-[0_5px_15px_rgba(23,53,122,0.18)]
              transition-all
              duration-200
              hover:bg-[#10295D]
              hover:shadow-[0_7px_20px_rgba(23,53,122,0.25)]
              active:scale-[0.98]
              sm:w-auto
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