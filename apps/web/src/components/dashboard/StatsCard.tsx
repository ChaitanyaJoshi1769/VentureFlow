interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export default function StatsCard({ title, value, change, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <p className={`text-sm font-medium mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? '📈' : '📉'} {change}
      </p>
    </div>
  );
}
