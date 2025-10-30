'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Loader2, AlertCircle, CheckCircle, Trash2, Mail, Calendar } from 'lucide-react';
import { getAdminUser, canManageDiscounts } from '@/lib/accessControl';

interface Discount {
  _id: string;
  discountCode: string;
  adminEmail: string;
  userEmail: string;
  eventName: string;
  eventId: string;
  discountAmount: number;
  isUsed: boolean;
  usedAt?: Date;
  createdAt: Date;
}

interface AdminUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  accesslevel: number;
  clubsoc: string;
  verified: boolean;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'unused'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const admin = getAdminUser();
    setAdminUser(admin);

    if (!admin || !canManageDiscounts(admin.accesslevel)) {
      setError('You do not have permission to view discounts');
      setLoading(false);
      return;
    }

    fetchDiscounts();
  }, []);

  useEffect(() => {
    let result = [...discounts];

    // Filter by status
    if (filterStatus === 'used') {
      result = result.filter(d => d.isUsed);
    } else if (filterStatus === 'unused') {
      result = result.filter(d => !d.isUsed);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        d =>
          d.discountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDiscounts(result);
  }, [discounts, searchTerm, filterStatus]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Session expired. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/discounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discounts');
      }

      const data = await response.json();
      console.log('Fetched discounts from admin page:', data.discounts);
      setDiscounts(data.discounts || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch discounts');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    setDeletingId(id);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Session expired. Please login again.');
        return;
      }

      const response = await fetch(`/api/discounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete discount');
      }

      setDiscounts(discounts.filter(d => d._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete discount');
      console.error('Error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (error && loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#140655' }}>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#140655' }}>
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-magenta-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">💰</span>
            <h1 className="text-4xl font-bold text-white">Discount Management</h1>
            <span className="text-4xl">🎟️</span>
          </div>
          <p className="text-slate-300">Manage all discount codes and track their usage</p>
        </div>

        {/* Error Message */}
        {error && !loading && (
          <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
            <button
              onClick={fetchDiscounts}
              className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-slate-900/50 rounded-3xl shadow-2xl backdrop-blur-md border-2 border-slate-400/25 overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="sticky top-0 z-40 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/70 backdrop-blur-md border-b-2 border-purple-500/30 px-6 py-5 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Search by code, email, or event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/30 transition"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-xl text-white focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/30 transition"
              >
                <option value="all">All Codes</option>
                <option value="unused">Unused Only</option>
                <option value="used">Used Only</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchDiscounts}
                disabled={loading}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : '↻ Refresh'}
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <span className="text-slate-300">
                  Total: <span className="text-white font-semibold">{discounts.length}</span>
                </span>
              </div>
              <div className="px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <span className="text-slate-300">
                  Unused: <span className="text-green-300 font-semibold">{discounts.filter(d => !d.isUsed).length}</span>
                </span>
              </div>
              <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <span className="text-slate-300">
                  Used: <span className="text-amber-300 font-semibold">{discounts.filter(d => d.isUsed).length}</span>
                </span>
              </div>
              <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <span className="text-slate-300">
                  Total Savings: <span className="text-blue-300 font-semibold">₹{discounts.reduce((sum, d) => sum + d.discountAmount, 0)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 p-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-900 border-t-purple-500"></div>
              </div>
              <p className="mt-4 text-slate-300 font-semibold animate-pulse">Loading discount codes...</p>
            </div>
          ) : filteredDiscounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 p-6">
              <p className="text-white text-xl font-bold mb-2">🎟️ No discounts found</p>
              <p className="text-slate-300 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 border-b-2 border-purple-500/20">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-white">Code</th>
                    <th className="px-6 py-4 text-left font-semibold text-white hidden sm:table-cell">User Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-white hidden md:table-cell">Event</th>
                    <th className="px-6 py-4 text-left font-semibold text-white hidden lg:table-cell">Admin</th>
                    <th className="px-6 py-4 text-left font-semibold text-white">Amount</th>
                    <th className="px-6 py-4 text-left font-semibold text-white">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-white hidden sm:table-cell">Created</th>
                    <th className="px-6 py-4 text-center font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {filteredDiscounts.map((discount, index) => (
                    <motion.tr
                      key={discount._id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`hover:bg-purple-500/5 transition-all ${
                        index % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-700/20'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {discount.discountCode}
                          </span>
                          <button
                            onClick={() => handleCopyCode(discount.discountCode)}
                            className="p-1.5 hover:bg-purple-500/20 rounded transition"
                            title="Copy code"
                          >
                            <Copy
                              size={16}
                              className={`transition ${
                                copiedCode === discount.discountCode ? 'text-green-400' : 'text-gray-400'
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-slate-300">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-500" />
                          <span className="truncate">{discount.userEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-white">
                        <span className="px-2 py-1 bg-blue-600/20 rounded text-sm">{discount.eventName}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-slate-400 text-xs">
                        {discount.adminEmail}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-300">₹{discount.discountAmount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            discount.isUsed
                              ? 'bg-amber-600/30 text-amber-100'
                              : 'bg-green-600/30 text-green-100'
                          }`}
                        >
                          {discount.isUsed ? '✓ Used' : '⏳ Unused'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-slate-400 text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(discount.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleDeleteDiscount(discount._id)}
                            disabled={deletingId === discount._id}
                            className="p-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-500 text-white transition-all hover:shadow-lg hover:shadow-red-500/50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deletingId === discount._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
