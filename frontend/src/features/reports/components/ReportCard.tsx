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
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-7
        shadow-sm
        transition-all
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div className="space-y-3">

        <h2 className="text-xl font-semibold text-slate-800">
          {title}
        </h2>

        <p className="text-sm leading-6 text-slate-500">
          {description}
        </p>

      </div>

      <div className="mt-8 flex gap-3">

        <button
          onClick={onPdf}
          className="
            flex-1
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#17357A]
            px-5
            py-3
            font-medium
            text-white
            transition
            hover:bg-[#21469E]
          "
        >
          <FiFileText size={18} />
          Export PDF
        </button>

        <button
          onClick={onExcel}
          className="
            flex-1
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-300
            bg-white
            px-5
            py-3
            font-medium
            text-slate-700
            transition
            hover:bg-slate-50
          "
        >
          <FiDownload size={18} />
          Export Excel
        </button>

      </div>

    </div>
  );
};

export default ReportCard;