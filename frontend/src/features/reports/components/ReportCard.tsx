import { FiDownload, FiFileText } from "react-icons/fi";

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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all">
      <h2 className="text-xl font-semibold text-slate-800">
        {title}
      </h2>

      <p className="text-slate-500 mt-2 mb-6">
        {description}
      </p>

      <div className="flex gap-3">
        <button
          onClick={onPdf}
          className="flex items-center gap-2 bg-[#172B6B] hover:bg-[#0F1F52] text-white px-4 py-2 rounded-lg transition"
        >
          <FiFileText />
          PDF
        </button>

        <button
          onClick={onExcel}
          className="flex items-center gap-2 border border-slate-300 hover:bg-slate-100 px-4 py-2 rounded-lg transition"
        >
          <FiDownload />
          Excel
        </button>
      </div>
    </div>
  );
};

export default ReportCard;