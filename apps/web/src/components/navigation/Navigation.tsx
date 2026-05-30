import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavigationProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Navigation({ open }: NavigationProps) {
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Investors', href: '/investors', icon: '👥' },
    { label: 'Startups', href: '/startups', icon: '🚀' },
    { label: 'Pipeline', href: '/pipeline', icon: '📈' },
    { label: 'Pitch Decks', href: '/decks', icon: '📎' },
    { label: 'Analytics', href: '/analytics', icon: '📉' },
    { label: 'AI Copilot', href: '/copilot', icon: '🤖' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside
      className={`${
        open ? 'w-64' : 'w-20'
      } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
    >
      <div className="p-4 border-b border-gray-800">
        <h1 className={`text-xl font-bold ${!open && 'text-center'}`}>
          {open ? 'VentureFlow' : 'VF'}
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              router.pathname === item.href
                ? 'bg-blue-600'
                : 'hover:bg-gray-800'
            } ${!open && 'justify-center'}`}
          >
            <span className="text-xl">{item.icon}</span>
            {open && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition">
          {open ? 'New Startup' : '+'}
        </button>
      </div>
    </aside>
  );
}
