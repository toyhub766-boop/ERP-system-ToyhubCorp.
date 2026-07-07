type Props = {
  status: string;
};

const StatusBadge = ({ status }: Props) => {
  const styles = {
    Healthy: "bg-green-100 text-green-700",
    "Low Stock": "bg-yellow-100 text-yellow-700",
    Critical: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        styles[status as keyof typeof styles] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      <span className="mr-1 h-2 w-2 rounded-full bg-current opacity-70"></span>
      {status}
    </span>
  );
};

export default StatusBadge;