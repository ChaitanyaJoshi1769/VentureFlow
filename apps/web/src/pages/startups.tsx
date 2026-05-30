import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '@/lib/auth';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useApi } from '@/hooks/useApi';

interface Startup {
  id: string;
  name: string;
  description: string;
  industry: string;
  currentStage: string;
  targetAmount: number;
  raised: number;
}

export default function StartupsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: startups = [], isLoading } = useApi<Startup[]>(
    ['startups'],
    `/startups?search=${search}`
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const fundingProgress = (startup: Startup) => {
    return ((startup.raised / startup.targetAmount) * 100).toFixed(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Startups</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add Startup
          </button>
        </div>

        <div className="flex gap-4">
          <input
            type="search"
            placeholder="Search startups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Industries</option>
            <option value="AI">AI</option>
            <option value="FinTech">FinTech</option>
            <option value="HealthTech">HealthTech</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading startups...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((startup) => (
              <div key={startup.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-gray-900">{startup.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{startup.description}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Industry: {startup.industry}</span>
                    <span className="text-gray-600">Stage: {startup.currentStage}</span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Funding</span>
                      <span className="font-medium">${(startup.raised / 1000000).toFixed(1)}M / ${(startup.targetAmount / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${fundingProgress(startup)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
