import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { isAuthenticated } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-8 bg-black bg-opacity-20">
        <h1 className="text-3xl font-bold text-white">VentureFlow AI</h1>
        <div className="flex gap-4">
          <Link href="/login" className="text-white hover:text-blue-200 font-medium">
            Sign In
          </Link>
          <Link href="/signup" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center max-w-2xl px-8">
          <h2 className="text-5xl font-bold text-white mb-6">
            AI-Powered Fundraising Platform
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Connect with the right investors, manage your pipeline, and close more deals with intelligent matching and AI-powered insights.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50">
              Get Started Free
            </Link>
            <Link href="#features" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10">
              Learn More
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 text-white">
            <div>
              <div className="text-3xl font-bold">100k+</div>
              <div className="text-blue-200">Investors</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-blue-200">Startups</div>
            </div>
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-blue-200">Uptime</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
