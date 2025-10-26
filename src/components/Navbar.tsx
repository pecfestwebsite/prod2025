'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Menu, X, Home } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const isBrochurePage = pathname === '/brochure';
  const isRegisterPage = pathname === '/register';

  // Show minimal navbar on register page with only home button
  if (isRegisterPage) {
    return (
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 font-[var(--font-geist)]"
      >
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] hover:from-[#ed6ab8] hover:to-[#b53da1] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/50"
            >
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-7 h-7 text-white" />
              </motion.div>
            </Link>
            <div />
          </div>
        </div>
      </motion.nav>
    );
  }

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/aboutus' },
    { label: 'Events', href: '/events' },
    // { label: 'Brochure', href: '/brochure' }, ABHI KE LIYE BROCHURE HATARKHA 
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 font-[var(--font-geist)] ${isBrochurePage ? 'pt-10' : ''}`}
      >
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center gap-6 bg-[#010101]/40 backdrop-blur-sm rounded-full px-8 py-4 border border-[#b53da1]/40">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[#fea6cc] hover:text-[#ffd4b9] transition-colors duration-300 text-base font-semibold"
                  >
                    <motion.span
                      whileHover={{ scale: 1.1, textShadow: '0 0 8px #ed6ab8' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Hamburger Menu on Left */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] hover:from-[#ed6ab8] hover:to-[#b53da1] transition-all duration-300 shadow-lg"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Spacer for mobile to center items */}
            <div className="md:hidden flex-1" />

            {/* Profile Icon - Absolutely Right Aligned */}
            {user && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] hover:from-[#ed6ab8] hover:to-[#b53da1] transition-all duration-300 shadow-lg"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-[#010101]/90 backdrop-blur-sm border border-[#b53da1]/40 rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[#b53da1]/30">
                      <p className="text-[#ffd4b9] text-sm font-bold truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="w-full flex items-center gap-2 px-4 py-3 text-[#fea6cc] hover:bg-[#b53da1]/20 transition-colors duration-200"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span className="font-bold text-sm">My Profile</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-[#fea6cc] hover:bg-[#b53da1]/20 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-bold text-sm">Logout</span>
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }} 
            className="fixed left-0 top-0 bottom-0 w-1/2 z-40 md:hidden bg-gradient-to-br from-[#010101]/40 via-[#1a0a1a]/50 to-[#010101]/40 backdrop-blur-3xl border-r border-[#b53da1]/30 rounded-r-3xl"
            style={{
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}
          >
            <div className="h-full flex flex-col items-center justify-center space-y-8 px-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className="text-[#fea6cc] hover:text-[#ffd4b9] transition-colors duration-300 font-bold text-2xl py-4 text-center w-full"
                >
                  <motion.span
                    whileHover={{ scale: 1.1, textShadow: '0 0 20px #ed6ab8' }}
                    whileTap={{ scale: 0.95 }}
                    className="block"
                  >
                    {item.label}
                  </motion.span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
