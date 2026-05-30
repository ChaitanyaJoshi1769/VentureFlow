import { useState } from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { isAuthenticated } from '@/lib/auth';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useApi } from '@/hooks/useApi';

interface Investor {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  firm: string;
  sectors: string[];
  stages: string[];
}

export default function InvestorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: investors = [], isLoading } = useApi<Investor[]>(
    ['investors'],
    `/investors?search=${search}`
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Investors</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add Investor
          </button>
        </div>

        <div className="flex gap-4">
          <input
            type="search"
            placeholder="Search by name, firm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Sectors</option>
            <option value="AI">AI</option>
            <option value="FinTech">FinTech</option>
            <option value="HealthTech">HealthTech</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Stages</option>
            <option value="Seed">Seed</option>
            <option value="SeriesA">Series A</option>
            <option value="SeriesB">Series B</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading investors...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Firm</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sectors</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stages</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {investors.map((investor) => (
                  <tr key={investor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {investor.firstName} {investor.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{investor.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{investor.firm}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {investor.sectors.slice(0, 2).map((s) => (
                          <span key={s} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {investor.stages.slice(0, 2).map((s) => (
                          <span key={s} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
