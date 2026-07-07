import Card from "./Card";

type Props = {
  title: string;
  value: string | number;
};

const StatCard = ({ title, value }: Props) => {
  return (
    <Card>
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="text-4xl font-bold mt-3">
        {value}
      </h2>
    </Card>
  );
};

export default StatCard;