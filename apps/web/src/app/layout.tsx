import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VentureFlow AI - The Operating System For Startup Fundraising',
  description:
    'Discover investors, manage relationships, track fundraising, and collaborate with your team. The complete operating system for startup fundraising.',
  keywords: [
    'fundraising',
    'investor database',
    'startup CRM',
    'pitch deck tracking',
    'investor outreach',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ventureflow.io',
    title: 'VentureFlow AI',
    description: 'The Operating System For Startup Fundraising',
    siteName: 'VentureFlow AI',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
