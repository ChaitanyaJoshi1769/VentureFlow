import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', contacts: 12, meetings: 5 },
  { name: 'Tue', contacts: 18, meetings: 8 },
  { name: 'Wed', contacts: 15, meetings: 6 },
  { name: 'Thu', contacts: 22, meetings: 10 },
  { name: 'Fri', contacts: 25, meetings: 12 },
  { name: 'Sat', contacts: 8, meetings: 3 },
  { name: 'Sun', contacts: 5, meetings: 2 },
];

export default function RecentActivityChart() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="contacts" fill="#3B82F6" />
          <Bar dataKey="meetings" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
