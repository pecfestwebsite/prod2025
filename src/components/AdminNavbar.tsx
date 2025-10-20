'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, Home, Calendar, Users, FileText, Plus, Eye, ChevronDown, User } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  accesslevel: number;
  clubsoc: string;
  verified: boolean;
}

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Load admin user info from localStorage on mount and listen for changes
  useEffect(() => {
    const loadAdminData = () => {
      const adminData = localStorage.getItem('adminUser');
      if (adminData) {
        try {
          const parsedUser = JSON.parse(adminData) as AdminUser;
          setAdminUser(parsedUser);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Failed to parse admin user data:', error);
          setIsLoggedIn(false);
        }
      } else {
        setAdminUser(null);
        setIsLoggedIn(false);
      }
    };

    // Load on mount
    loadAdminData();

    // Listen for storage changes (login/logout in other tabs or same tab)
    window.addEventListener('storage', loadAdminData);
    
    // Also listen for custom events from the same page
    const handleCustomStorageChange = () => {
      loadAdminData();
    };
    window.addEventListener('adminUserChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', loadAdminData);
      window.removeEventListener('adminUserChanged', handleCustomStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    document.cookie = 'adminToken=; path=/; max-age=0';
    setAdminUser(null);
    setIsLoggedIn(false);
    
    // Dispatch custom event to notify all listeners
    window.dispatchEvent(new Event('adminUserChanged'));
    
    router.push('/admin/login');
  };

  const menuGroups = {
    main: {
      label: 'Main',
      icon: Home,
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
        { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
      ],
    },
    events: {
      label: 'Events',
      icon: Calendar,
      items: [
        { label: 'Add Events', href: '/admin/addevents', icon: Plus },
        { label: 'View Events', href: '/admin/viewevents', icon: Eye },
      ],
    },
    manage: {
      label: 'Manage',
      icon: Users,
      items: [
        { label: 'Registrations', href: '/admin/registrations', icon: Users },
        { label: 'Clearance', href: '/admin/clearance', icon: FileText },
      ],
    },
  };

  const DropdownMenu = ({ groupKey, group }: { groupKey: string; group: typeof menuGroups.main }) => {
    const Icon = group.icon;
    const isOpen = openDropdown === groupKey;

    return (
      <div className="relative group">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : groupKey)}
          onMouseEnter={() => setOpenDropdown(groupKey)}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-slate-300 font-semibold transition-all duration-300 hover:text-slate-100 hover:bg-slate-400/15 border-2 border-transparent hover:border-slate-300/30 group relative"
        >
          <Icon size={20} className="group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">{group.label}</span>
          <ChevronDown
            size={18}
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-400 to-slate-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </button>

        {/* Dropdown Menu */}
        <div
          onMouseLeave={() => setOpenDropdown(null)}
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border-2 border-slate-400/30 shadow-2xl backdrop-blur-sm transition-all duration-300 origin-top ${
            isOpen
              ? 'opacity-100 scale-y-100 visible'
              : 'opacity-0 scale-y-95 invisible'
          }`}
          style={{ backgroundColor: 'rgba(21, 14, 92, 0.85)' }}
        >
          <div className="p-2 space-y-1">
            {group.items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 font-medium transition-all duration-300 hover:text-slate-100 hover:bg-slate-400/15 border border-transparent hover:border-slate-300/30 group/item"
                >
                  <ItemIcon size={18} className="group-hover/item:scale-110 transition-transform flex-shrink-0" />
                  <span>{item.label}</span>
                  <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-gradient-to-r from-slate-400 to-slate-300 transform scale-x-0 group-hover/item:scale-x-100 transition-transform duration-300" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <nav className="border-b-2 border-slate-400/20 sticky top-0 z-50 backdrop-blur-md shadow-lg" style={{ backgroundColor: '#0f0444' }}>
        {/* Desktop Layout */}
        <div className="hidden xl:block px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 max-w-7xl mx-auto">
            {/* Logo Section */}
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="text-3xl group-hover:scale-110 transition-transform duration-300 filter brightness-0 invert">✨</div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
                  PECFest
                </span>
                <span className="text-xs text-slate-400/60 font-semibold">Admin</span>
              </div>
            </Link>

            {/* Desktop Menu - 3 Centered Buttons */}
            <div className="flex items-center gap-6 flex-1 justify-center">
              {Object.entries(menuGroups).map(([key, group]) => (
                <DropdownMenu key={key} groupKey={key} group={group} />
              ))}
            </div>

            {/* Right Section - User Info and Logout (Only show when logged in) */}
            {isLoggedIn && adminUser && (
              <div className="flex items-center gap-4">
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-400/10 border-2 border-slate-300/20">
                  <User size={18} className="text-slate-300" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-100">{adminUser.name}</span>
                    <span className="text-xs text-slate-400">{adminUser.email}</span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-300 font-medium transition-all duration-300 hover:from-red-600/40 hover:to-red-700/40 hover:text-red-200 border-2 border-red-500/30 hover:border-red-400/50 group"
                >
                  <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="xl:hidden px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="text-3xl group-hover:scale-110 transition-transform duration-300 filter brightness-0 invert">✨</div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
                  PECFest
                </span>
                <span className="text-xs text-slate-400/60 font-semibold">Admin</span>
              </div>
            </Link>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Mobile Logout Button (Only show when logged in) */}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-lg hover:bg-red-600/30 text-red-300 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-lg hover:bg-blue-800/50 transition-colors text-slate-300"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="pb-6 border-t border-slate-400/20 space-y-2">
              {/* User Info in Mobile Menu */}
              {isLoggedIn && adminUser && (
                <div className="px-4 py-3 rounded-lg bg-slate-400/10 border-2 border-slate-300/20 mb-4">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-slate-300" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-100">{adminUser.name}</span>
                      <span className="text-xs text-slate-400">{adminUser.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {Object.entries(menuGroups).map(([key, group]) => (
                <div key={key} className="space-y-1">
                  {/* Mobile Category Header */}
                  <button
                    onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-400/10 border border-transparent hover:border-slate-300/30 mt-2"
                  >
                    <div className="flex items-center gap-2">
                      {React.createElement(group.icon, { size: 20 })}
                      {group.label}
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${
                        openDropdown === key ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Mobile Submenu Items */}
                  {openDropdown === key && (
                    <div className="space-y-1 pl-4">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 font-medium transition-all duration-300 hover:text-slate-100 hover:bg-slate-400/10 border border-transparent hover:border-slate-300/30"
                          onClick={() => {
                            setIsOpen(false);
                            setOpenDropdown(null);
                          }}
                        >
                          {React.createElement(item.icon, { size: 18 })}
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
