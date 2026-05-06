const StatCard = ({ label, value, icon: Icon, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700"
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <div className={`rounded-md p-2 ${tones[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold">{value ?? 0}</p>
    </div>
  );
};

export default StatCard;
