import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '@/lib/auth';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useApi } from '@/hooks/useApi';

interface PitchDeck {
  id: string;
  title: string;
  startupName: string;
  status: string;
  views: number;
  shares: number;
  createdAt: string;
}

export default function DecksPage() {
  const router = useRouter();
  const { data: decks = [], isLoading } = useApi<PitchDeck[]>(['decks'], '/decks');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Pitch Decks</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Upload Deck
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading decks...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div key={deck.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-32 flex items-center justify-center">
                  <span className="text-4xl">📊</span>
                </div>
                
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">{deck.startupName}</p>
                    <h3 className="font-bold text-gray-900">{deck.title}</h3>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>👁 {deck.views} views</span>
                    <span>🔗 {deck.shares} shares</span>
                  </div>

                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      deck.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {deck.status}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">{deck.createdAt}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-600 rounded">
                      View
                    </button>
                    <button className="flex-1 text-gray-600 hover:text-gray-800 text-sm font-medium py-2 border border-gray-300 rounded">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
