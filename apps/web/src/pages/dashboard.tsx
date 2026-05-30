import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { isAuthenticated, getUser } from '@/lib/auth';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivityChart from '@/components/dashboard/RecentActivityChart';

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">Here's your fundraising progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Investors"
            value="1,234"
            change="+12%"
            trend="up"
          />
          <StatsCard
            title="Active Startups"
            value="45"
            change="+8%"
            trend="up"
          />
          <StatsCard
            title="Pipeline Value"
            value="$45M"
            change="-2%"
            trend="down"
          />
          <StatsCard
            title="Conversion Rate"
            value="12.5%"
            change="+3%"
            trend="up"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivityChart />
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Pipeline Breakdown</h3>
            <div className="space-y-3">
              {['Target', 'Contacted', 'Meeting', 'Interested', 'Term Sheet'].map(
                (stage, i) => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{stage}</span>
                    <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(5 - i) * 20}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{(5 - i) * 10}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
