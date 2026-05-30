import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '@/lib/auth';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface PipelineCard {
  id: string;
  investorName: string;
  firm: string;
  scoreOverall: number;
  lastContact: string;
}

const pipelineData = {
  target: [
    { id: '1', investorName: 'Sarah Chen', firm: 'Accel', scoreOverall: 75, lastContact: '2024-06-15' },
    { id: '2', investorName: 'Mark Johnson', firm: 'Sequoia', scoreOverall: 82, lastContact: '2024-06-10' },
  ],
  contacted: [
    { id: '3', investorName: 'Lisa Wang', firm: 'Kleiner Perkins', scoreOverall: 85, lastContact: '2024-06-12' },
  ],
  meeting: [
    { id: '4', investorName: 'James Park', firm: 'a16z', scoreOverall: 88, lastContact: '2024-06-08' },
  ],
  interested: [
    { id: '5', investorName: 'Elena Rodriguez', firm: 'Greylock', scoreOverall: 90, lastContact: '2024-06-01' },
  ],
  term_sheet: [],
  closed: [],
};

const stages = [
  { key: 'target', label: 'Target', color: 'bg-gray-100' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-100' },
  { key: 'meeting', label: 'Meeting', color: 'bg-yellow-100' },
  { key: 'interested', label: 'Interested', color: 'bg-green-100' },
  { key: 'term_sheet', label: 'Term Sheet', color: 'bg-purple-100' },
  { key: 'closed', label: 'Closed', color: 'bg-emerald-100' },
];

function PipelineCard({ card }: { card: PipelineCard }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-move">
      <h4 className="font-semibold text-gray-900">{card.investorName}</h4>
      <p className="text-sm text-gray-600">{card.firm}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-2xl font-bold ${card.scoreOverall >= 85 ? 'text-green-600' : 'text-yellow-600'}`}>
          {card.scoreOverall}%
        </span>
        <span className="text-xs text-gray-500">{card.lastContact}</span>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Fundraising Pipeline</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add Investor
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {stages.map((stage) => (
              <div key={stage.key} className="flex-shrink-0 w-80">
                <div className={`${stage.color} rounded-lg p-4`}>
                  <h3 className="font-bold text-gray-900 mb-4">
                    {stage.label}
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      ({pipelineData[stage.key as keyof typeof pipelineData].length})
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {pipelineData[stage.key as keyof typeof pipelineData].map((card) => (
                      <PipelineCard key={card.id} card={card} />
                    ))}
                    
                    {pipelineData[stage.key as keyof typeof pipelineData].length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No investors
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
