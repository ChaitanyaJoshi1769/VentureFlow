import React, { useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

const analyticsData = [
  { month: 'Jan', investors: 45, startups: 12, deals: 2 },
  { month: 'Feb', investors: 52, startups: 15, deals: 3 },
  { month: 'Mar', investors: 48, startups: 18, deals: 5 },
  { month: 'Apr', investors: 61, startups: 22, deals: 7 },
  { month: 'May', investors: 55, startups: 25, deals: 6 },
  { month: 'Jun', investors: 67, startups: 28, deals: 8 },
];

const pipelineData = [
  { name: 'Target', value: 120 },
  { name: 'Contacted', value: 45 },
  { name: 'Meeting', value: 18 },
  { name: 'Interested', value: 8 },
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState('6m');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive pipeline and performance metrics</p>
          </div>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1m">Last 1 Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total Investors</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">328</p>
            <p className="text-green-600 text-sm mt-2">↑ 12% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Active Deals</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">31</p>
            <p className="text-green-600 text-sm mt-2">↑ 5 deals this month</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Avg Deal Cycle</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">120 days</p>
            <p className="text-red-600 text-sm mt-2">↑ 10 days slower</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Success Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">35%</p>
            <p className="text-green-600 text-sm mt-2">↑ 3% improvement</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Trend */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="investors" stroke="#3b82f6" />
                <Line type="monotone" dataKey="deals" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pipeline Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pipeline Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value}) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Funding Closed</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deals" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Rates */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Conversion Rates</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Target → Contacted</span>
                  <span className="text-sm font-medium text-gray-700">37.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '37.5%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Contacted → Meeting</span>
                  <span className="text-sm font-medium text-gray-700">40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '40%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Meeting → Deal</span>
                  <span className="text-sm font-medium text-gray-700">44%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '44%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Performers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Team Member</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Deals Closed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">Sarah Chen</td>
                  <td className="py-3 px-4 text-gray-700">5</td>
                  <td className="py-3 px-4 text-gray-700">$8.5M</td>
                  <td className="py-3 px-4"><span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">42%</span></td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">Mike Johnson</td>
                  <td className="py-3 px-4 text-gray-700">3</td>
                  <td className="py-3 px-4 text-gray-700">$5.2M</td>
                  <td className="py-3 px-4"><span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">38%</span></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">Lisa Wang</td>
                  <td className="py-3 px-4 text-gray-700">2</td>
                  <td className="py-3 px-4 text-gray-700">$3.1M</td>
                  <td className="py-3 px-4"><span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">35%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
