import Link from 'next/link';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-purple-900 to-indigo-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-xl font-bold text-white">
                PopScope
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium text-purple-200 hover:text-white hover:bg-purple-800/50 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 