import {
  FiDownload,
  FiFileText,
} from "react-icons/fi";

interface ReportCardProps {
  title: string;
  description: string;
  onPdf: () => void;
  onExcel: () => void;
}

const ReportCard = ({
  title,
  description,
  onPdf,
  onExcel,
}: ReportCardProps) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-200
        hover:shadow-md
        sm:rounded-3xl
        sm:p-6
        lg:p-7
      "
    >
      {/* Content */}

      <div className="space-y-2.5 sm:space-y-3">
        <h2
          className="
            text-lg
            font-semibold
            leading-tight
            text-slate-800
            sm:text-xl
          "
        >
          {title}
        </h2>

        <p
          className="
            text-xs
            leading-5
            text-slate-500
            sm:text-sm
            sm:leading-6
          "
        >
          {description}
        </p>
      </div>

      {/* Actions */}

      <div
        className="
          mt-5
          grid
          grid-cols-1
          gap-2.5
          sm:mt-7
          sm:grid-cols-2
          sm:gap-3
        "
      >
        <button
          type="button"
          onClick={onPdf}
          className="
            flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#17357A]
            px-4
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-[#21469E]
            active:scale-[0.98]
          "
        >
          <FiFileText size={17} />
          Export PDF
        </button>

        <button
          type="button"
          onClick={onExcel}
          className="
            flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-sm
            font-semibold
            text-slate-700
            transition
            hover:bg-slate-50
            active:scale-[0.98]
          "
        >
          <FiDownload size={17} />
          Export Excel
        </button>
      </div>
    </div>
  );
};

export default ReportCard;