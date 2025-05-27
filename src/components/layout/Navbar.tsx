'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Home, LogOut, User, Plus } from 'lucide-react';
import Link from 'next/link';
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuthContext();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 dark:bg-gray-900 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/boards" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-white text-2xl font-bold">Trello Clone</h1>
              </div>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link
                href="/boards"
                className="text-white hover:bg-blue-700 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
              >
                <Home className="h-4 w-4 mr-1" />
                Boards
              </Link>
              <button
                className="text-white hover:bg-blue-700 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <GlobalSearchBar />
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle variant="button" size="sm" />

            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center text-white hover:bg-blue-700 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <User className="h-4 w-4 mr-1" />
                  {user.displayName || user.email}
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setDropdownOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            router.push('/profile');
                            setDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 