export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          VentureFlow AI
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          The Operating System For Startup Fundraising
        </p>

        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400"
          >
            Get Started
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Investor Database</h3>
            <p className="text-gray-600">
              Access 100,000+ investors with advanced search and AI matching.
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">CRM Pipeline</h3>
            <p className="text-gray-600">
              Manage your fundraising workflow with kanban-style pipeline.
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Pitch Deck Tracking</h3>
            <p className="text-gray-600">
              Track investor engagement with advanced analytics and heatmaps.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
