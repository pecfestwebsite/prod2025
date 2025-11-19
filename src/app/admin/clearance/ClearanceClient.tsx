'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, ChevronDown, Check, X, Loader, Plus, Shield, Trash2, Edit } from 'lucide-react';
import { getAdminUser, getLockedSocietyName } from '@/lib/accessControl';

interface IAdmin {
  _id: string;
  email: string;
  userId: string;
  accesslevel: number;
  clubsoc: string;
  verified: boolean;
  name: string;
  dateTime: string;
  createdAt: string;
}

interface ClearanceClientProps {
  admins: IAdmin[];
}

interface CurrentAdminUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  accesslevel: number;
  clubsoc: string;
  verified: boolean;
}

type SortField = 'name' | 'email' | 'accesslevel' | 'clubsoc' | 'verified' | 'dateTime';
type SortOrder = 'asc' | 'desc';

const ACCESS_LEVELS = [
  { value: 0, label: 'Simple User', icon: '👤', color: 'slate' },
  { value: 1, label: 'Club/Soc Admin', icon: '⚡', color: 'blue' },
  { value: 2, label: 'Super Admin', icon: '🌟', color: 'purple' },
  { value: 3, label: 'Webmaster', icon: '👑', color: 'amber' },
];

const CLUBS_SOCS = [
  "None",
  //Clubs
  'Dramatics', 'SAASC', 'APC', 'ELC', 'Music',
  'HEB', 'PDC', 'PEB', 'Rotaract', 'SCC',
  'CIM', 'EIC', 'WEC', 'EEB', "NCC", "NSS", "Sports",

  //SOCS
  'Robotics', 'ACM', 'ATS', 'ASME', 'ASCE',
  'ASPS', 'IEEE', 'IGS', 'IIM',
  'SESI', 'SAE', 'SME', "ES"
];

export default function ClearanceClient({ admins }: ClearanceClientProps) {
  const [sortField, setSortField] = useState<SortField>('accesslevel');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [localAdmins, setLocalAdmins] = useState<IAdmin[]>(admins || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<IAdmin | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdminUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userId: '',
    accesslevel: 0,
    clubsoc: '',
    verified: false,
  });

  useEffect(() => {
    setMounted(true);
    const admin = getAdminUser();
    if (admin) {
      // Redirect club/soc admins (access level 1) - they don't have access to clearance
      if (admin.accesslevel === 1) {
        window.location.href = '/admin/dashboard';
        return;
      }
      setCurrentAdmin(admin);
    } else {
      // If no admin found, redirect to login
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    if (admins && admins.length > 0) setLocalAdmins(admins);
  }, [admins]);

  useEffect(() => {
    const saved = localStorage.getItem('clearanceFilters');
    if (saved) {
      try {
        const filters = JSON.parse(saved);
        setSearchTerm(filters.searchTerm || '');
        setFilterLevel(filters.filterLevel || 'all');
        setFilterVerified(filters.filterVerified || 'all');
        setSortField(filters.sortField || 'accesslevel');
        setSortOrder(filters.sortOrder || 'desc');
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('clearanceFilters', JSON.stringify({ searchTerm, filterLevel, filterVerified, sortField, sortOrder }));
  }, [searchTerm, filterLevel, filterVerified, sortField, sortOrder]);

  // Helper functions for access control
  const canViewAdmin = (admin: IAdmin): boolean => {
    if (!currentAdmin) return false;
    if (currentAdmin.accesslevel === 3) return true; // Webmaster sees all
    if (currentAdmin.accesslevel === 2) {
      // Super Admin can see levels 0, 1, and 2 (same level)
      return admin.accesslevel !== 3;
    }
    if (currentAdmin.accesslevel === 1) {
      // Club/Soc Admin can see levels 0 and 1 (same level)
      return admin.accesslevel === 0 || admin.accesslevel === 1;
    }
    return false;
  };

  const canEditAdmin = (admin: IAdmin): boolean => {
    if (!currentAdmin) return false;
    if (currentAdmin.accesslevel === 3) return true; // Webmaster can edit any
    if (currentAdmin.accesslevel === 2) {
      // Super Admin can edit levels 0 and 1, but not 2 or 3
      return admin.accesslevel === 0 || admin.accesslevel === 1;
    }
    if (currentAdmin.accesslevel === 1) {
      // Club/Soc Admin can edit level 0 only
      return admin.accesslevel === 0;
    }
    return false;
  };

  const canAddLevel = (targetLevel: number): boolean => {
    if (!currentAdmin) return false;
    if (currentAdmin.accesslevel === 3) return true; // Webmaster can add any
    if (currentAdmin.accesslevel === 2) {
      // Super Admin can add levels 0 and 1, but not 2 or 3
      return targetLevel === 0 || targetLevel === 1;
    }
    if (currentAdmin.accesslevel === 1) {
      // Club/Soc Admin can only add level 0
      return targetLevel === 0;
    }
    return false;
  };

  const canDeleteAdmin = (admin: IAdmin): boolean => {
    if (!currentAdmin) return false;
    if (currentAdmin.accesslevel === 3) return true; // Webmaster can delete any
    if (currentAdmin.accesslevel === 2) {
      // Super Admin can delete levels 0 and 1, but not 2 or 3
      return admin.accesslevel === 0 || admin.accesslevel === 1;
    }
    if (currentAdmin.accesslevel === 1) {
      // Club/Soc Admin can delete level 0
      return admin.accesslevel === 0;
    }
    return false;
  };

  const isUserIdLocked = (): boolean => {
    // Lock userId when:
    // 1. Adding a new admin AND the access level being set is the same as current admin's level (but NOT for Webmaster)
    // 2. OR editing an existing admin (always locked)
    if (!currentAdmin) return false;
    
    // Webmaster (access level 3) can always edit userId
    if (currentAdmin.accesslevel === 3) {
      return false;
    }
    
    if (editingAdmin) {
      // When editing, always lock the userId field
      return true;
    }
    if (!editingAdmin) {
      // Adding new admin - lock if setting same access level (but not for Webmaster)
      return formData.accesslevel === currentAdmin.accesslevel;
    }
    return false;
  };

  const isClubsocLocked = (): boolean => {
    // Use getLockedSocietyName to check if club is locked
    const lockedSociety = getLockedSocietyName(currentAdmin);
    return lockedSociety !== null && !editingAdmin;
  };

  const getAvailableAccessLevels = (): typeof ACCESS_LEVELS => {
    if (!currentAdmin) return [];
    if (currentAdmin.accesslevel === 3) return ACCESS_LEVELS; // Webmaster sees all
    if (currentAdmin.accesslevel === 2) {
      // Super Admin doesn't see Webmaster option
      return ACCESS_LEVELS.filter(l => l.value !== 3);
    }
    if (currentAdmin.accesslevel === 1) {
      // Club/Soc Admin only sees Simple User and Club/Soc Admin
      return ACCESS_LEVELS.filter(l => l.value === 0 || l.value === 1);
    }
    return [];
  };

  // Compute locked society name
  const lockedSociety = useMemo(() => {
    if (!currentAdmin) return null;
    // Cast currentAdmin to AdminUser type for the function
    return getLockedSocietyName(currentAdmin as any);
  }, [currentAdmin]);

  const filteredAndSortedAdmins = useMemo(() => {
    let filtered = [...(localAdmins || [])];

    // Filter by visibility permissions
    filtered = filtered.filter(a => canViewAdmin(a));

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.clubsoc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLevel !== 'all') filtered = filtered.filter(a => a.accesslevel === filterLevel);
    if (filterVerified === 'verified') filtered = filtered.filter(a => a.verified);
    else if (filterVerified === 'unverified') filtered = filtered.filter(a => !a.verified);

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortField) {
        case 'name': aValue = a.name; bValue = b.name; break;
        case 'email': aValue = a.email; bValue = b.email; break;
        case 'accesslevel': aValue = a.accesslevel; bValue = b.accesslevel; break;
        case 'clubsoc': aValue = a.clubsoc; bValue = b.clubsoc; break;
        case 'verified': aValue = a.verified ? 1 : 0; bValue = b.verified ? 1 : 0; break;
        case 'dateTime': aValue = new Date(a.dateTime).getTime(); bValue = new Date(b.dateTime).getTime(); break;
        default: return 0;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [localAdmins, searchTerm, filterLevel, filterVerified, sortField, sortOrder, currentAdmin]);

  const handleAccessLevelChange = (newLevel: number) => {
    setFormData(prev => {
      const updatedData = { ...prev, accesslevel: newLevel };
      // If adding new admin and current admin is a Club/Soc admin, set clubsoc to their club
      if (!editingAdmin && currentAdmin?.accesslevel === 1) {
        updatedData.clubsoc = currentAdmin.clubsoc;
      }
      // If changing to same level as current admin and adding new admin, set userId to current admin's userId
      if (!editingAdmin && newLevel === currentAdmin?.accesslevel && currentAdmin) {
        updatedData.userId = currentAdmin.userId;
      }
      return updatedData;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const openModal = (admin?: IAdmin) => {
    if (admin) {
      setEditingAdmin(admin);
      // When editing, keep the admin's original data
      setFormData({ name: admin.name, email: admin.email, userId: admin.userId, accesslevel: admin.accesslevel, clubsoc: admin.clubsoc, verified: admin.verified });
    } else {
      setEditingAdmin(null);
      // When adding new admin, use current admin's userId and clubsoc (for Club/Soc admins)
      const userIdValue = currentAdmin ? currentAdmin.userId : '';
      const clubsocValue = currentAdmin?.accesslevel === 1 ? currentAdmin.clubsoc : '';
      setFormData({ name: '', email: '', userId: userIdValue, accesslevel: 0, clubsoc: clubsocValue, verified: false });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingAdmin(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Query full database for validation
      const dbRes = await fetch('/api/admins?limit=1000');
      if (!dbRes.ok) throw new Error('Failed to fetch database');
      const response = await dbRes.json();
      const allAdmins = response.admins || response;

      // Check email validation for both adding AND editing
      // For editing, exclude the current admin being edited from the check
      const emailCheckAdmins = editingAdmin 
        ? allAdmins.filter((admin: any) => admin._id !== editingAdmin._id)
        : allAdmins;
      
      const emailExists = emailCheckAdmins.some((admin: any) => admin.email.toLowerCase() === formData.email.toLowerCase());
      if (emailExists) {
        alert('❌ This email is already registered in the database');
        return;
      }

      // Additional validation only for adding new admin
      if (!editingAdmin) {
        // 2) Check userId rules: same userId can only be used with same access level (not across different levels)
        const adminWithSameUserId = allAdmins.find((admin: any) => admin.userId === formData.userId);
        if (adminWithSameUserId && adminWithSameUserId.accesslevel !== formData.accesslevel) {
          alert('❌ This User ID is already assigned to a different access level.\nUser IDs can only be shared within the same access level.');
          return;
        }

        // 3) Check if adding same access level and userId - limit to 5 entries max
        const sameAccessLevelAndUserId = allAdmins.filter(
          (admin: any) => admin.userId === formData.userId && admin.accesslevel === formData.accesslevel
        );
        if (sameAccessLevelAndUserId.length >= 5) {
          alert('❌ Maximum 5 entries allowed for the same User ID and Access Level combination.');
          return;
        }
      }

      const url = editingAdmin ? `/api/admins/${editingAdmin._id}` : '/api/admins';
      const res = await fetch(url, {
        method: editingAdmin ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const result = await res.json();
        const savedAdmin = result.admin || result;
        if (editingAdmin) setLocalAdmins(prev => prev.map(a => (a._id === editingAdmin._id ? savedAdmin : a)));
        else setLocalAdmins(prev => [savedAdmin, ...prev]);
        closeModal();
      } else alert(`Error: ${(await res.json()).error || 'Failed to save'}`);
    } catch (error) { alert('Error saving admin'); }
  };

  const handleVerify = async (id: string, status: boolean) => {
    setVerifyingId(id);
    try {
      const res = await fetch(`/api/admins/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !status }),
      });
      if (res.ok) setLocalAdmins(prev => prev.map(a => a._id === id ? { ...a, verified: !status } : a));
      else alert('Failed to update');
    } catch (error) { alert('Error updating'); }
    finally { setVerifyingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this guardian?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admins/${id}`, { method: 'DELETE' });
      if (res.ok) setLocalAdmins(prev => prev.filter(a => a._id !== id));
      else alert('Failed to delete');
    } catch (error) { alert('Error deleting'); }
    finally { setDeletingId(null); }
  };

  const getAccessBadge = (level: number) => {
    const cfg = ACCESS_LEVELS[level] || ACCESS_LEVELS[0];
    const colors = { slate: 'bg-slate-900/50 border-slate-400/50 text-slate-300', blue: 'bg-blue-900/50 border-blue-400/50 text-blue-300', purple: 'bg-purple-900/50 border-purple-400/50 text-purple-300', amber: 'bg-amber-900/50 border-amber-400/50 text-amber-300' };
    return <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${colors[cfg.color as keyof typeof colors]}`}><span className="text-lg filter brightness-0 invert">{cfg.icon}</span><span className="font-bold text-sm">{cfg.label}</span></div>;
  };

  const SortIcon = ({ field }: { field: SortField }) => sortField !== field ? <div className="w-4 h-4" /> : sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;

  return (
    <div className="p-6 space-y-6">
      {!mounted ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-900 border-t-purple-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl filter brightness-0 invert">🔐</span>
            </div>
          </div>
          <p className="mt-4 text-slate-300 font-semibold animate-pulse">Loading clearance data...</p>
        </div>
      ) : (
        <>
      {/* Floating Search and Filter Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/70 backdrop-blur-md border-b-2 border-purple-500/30 rounded-b-lg md:rounded-b-2xl px-4 md:px-6 py-4 md:py-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <input type="text" placeholder="🔍 Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg md:rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 text-sm md:text-base shadow-md transition-all" />
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="px-3 md:px-4 py-2.5 md:py-3 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg md:rounded-xl text-white focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 text-sm md:text-base shadow-md transition-all">
            <option value="all">🔓 All Levels</option>
            {ACCESS_LEVELS.map(l => <option key={l.value} value={l.value}>{l.icon} {l.label}</option>)}
          </select>
          <select value={filterVerified} onChange={e => setFilterVerified(e.target.value as any)} className="px-3 md:px-4 py-2.5 md:py-3 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-purple-500/40 rounded-lg md:rounded-xl text-white focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/80 focus:ring-2 focus:ring-purple-500/30 text-sm md:text-base shadow-md transition-all">
            <option value="all">📋 All Status</option>
            <option value="verified">✓ Blessed</option>
            <option value="unverified">⏳Cursed</option>
          </select>
        </div>
        <div className="flex items-center justify-between px-3 md:px-4 py-2 bg-slate-800/40 border border-purple-500/20 rounded-lg flex-wrap gap-2">
          <p className="text-xs md:text-sm text-slate-300">📊 Showing <span className="font-bold text-white">{filteredAndSortedAdmins.length}</span> of <span className="font-bold text-white">{localAdmins.length}</span></p>
          <button onClick={() => openModal()} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 px-3 md:px-4 py-2 rounded-lg font-bold text-white text-sm"><Plus size={16} /><span className="hidden sm:inline">Add</span></button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-slate-400/25">
        <table className="w-full">
          <thead><tr className="bg-slate-800/50 border-b-2 border-purple-500/20">
            <th className="px-4 py-4 text-left"><button onClick={() => handleSort('name')} className="flex items-center gap-2 text-white font-bold hover:text-slate-300 uppercase text-sm">👤 Name<SortIcon field="name" /></button></th>
            <th className="px-4 py-4 text-left"><button onClick={() => handleSort('email')} className="flex items-center gap-2 text-white font-bold hover:text-slate-300 uppercase text-sm">📧 Email<SortIcon field="email" /></button></th>
            <th className="px-4 py-4 text-left"><button onClick={() => handleSort('clubsoc')} className="flex items-center gap-2 text-white font-bold hover:text-slate-300 uppercase text-sm">🏛️ Club<SortIcon field="clubsoc" /></button></th>
            <th className="px-4 py-4 text-center"><button onClick={() => handleSort('accesslevel')} className="flex items-center gap-2 text-white font-bold hover:text-slate-300 uppercase text-sm mx-auto">🔐 Level<SortIcon field="accesslevel" /></button></th>
            <th className="px-4 py-4 text-center"><button onClick={() => handleSort('verified')} className="flex items-center gap-2 text-white font-bold hover:text-slate-300 uppercase text-sm mx-auto">✓ Status<SortIcon field="verified" /></button></th>
            <th className="px-4 py-4 text-left"><button onClick={() => handleSort('dateTime')} className="flex items-center gap-2 text-white font-bold hover:text-slate-300 uppercase text-sm">📅 Added<SortIcon field="dateTime" /></button></th>
            <th className="px-4 py-4 text-center text-white font-bold uppercase text-sm">⚙️ Actions</th>
          </tr></thead>
          <tbody>
            {filteredAndSortedAdmins.length > 0 ? filteredAndSortedAdmins.map(admin => (
              <tr key={admin._id} className="bg-slate-800/30 hover:bg-slate-700/30 border-b border-purple-500/10">
                <td className="px-4 py-4"><div className="flex items-start gap-2"><span className="text-xl hidden sm:inline filter brightness-0 invert">🎭</span><div><p className="font-bold text-white">{admin.name}</p><p className="text-xs text-slate-400 mt-1">{admin.userId}</p></div></div></td>
                <td className="px-4 py-4"><p className="font-semibold text-white text-sm">{admin.email}</p></td>
                <td className="px-4 py-4"><p className="font-semibold text-purple-300 text-sm">{admin.clubsoc}</p></td>
                <td className="px-4 py-4 text-center">{getAccessBadge(admin.accesslevel)}</td>
                <td className="px-4 py-4 text-center">
                  {admin.verified ? <div className="inline-flex items-center gap-1 bg-emerald-900/50 px-3 py-1 rounded-lg border border-emerald-400/50"><Check size={16} className="text-emerald-400" /><span className="font-bold text-emerald-300 text-sm">Blessed</span></div> : <div className="inline-flex items-center gap-1 bg-orange-900/50 px-3 py-1 rounded-lg border border-orange-400/50"><X size={16} className="text-orange-400" /><span className="font-bold text-orange-300 text-sm">Pending</span></div>}
                </td>
                <td className="px-4 py-4"><p className="font-semibold text-white text-sm">{new Date(admin.dateTime).toLocaleDateString('en-US', { timeZone:'UTC',year: 'numeric', month: 'short', day: 'numeric' })}</p></td>
                <td className="px-4 py-4"><div className="flex items-center justify-center gap-2">
                  <button onClick={() => openModal(admin)} disabled={!canEditAdmin(admin)} className="p-2 bg-blue-900/50 hover:bg-blue-900/80 rounded-lg border-2 border-blue-500/50 hover:border-blue-500 text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed" title="Edit"><Edit size={16} /></button>
                  <button onClick={() => handleVerify(admin._id, admin.verified)} disabled={verifyingId === admin._id} className={`p-2 rounded-lg border-2 ${admin.verified ? 'bg-orange-900/50 hover:bg-orange-900/80 border-orange-500/50 text-orange-300' : 'bg-green-900/50 hover:bg-green-900/80 border-green-500/50 text-green-300'} disabled:opacity-50`} title={admin.verified ? 'Unverify' : 'Verify'}>{verifyingId === admin._id ? <Loader size={16} className="animate-spin" /> : admin.verified ? <Shield size={16} /> : <Check size={16} />}</button>
                  <button onClick={() => handleDelete(admin._id)} disabled={deletingId === admin._id || !canDeleteAdmin(admin)} className="p-2 bg-red-900/50 hover:bg-red-900/80 rounded-lg border-2 border-red-500/50 text-red-300 disabled:opacity-30 disabled:cursor-not-allowed" title="Delete">{deletingId === admin._id ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>
                </div></td>
              </tr>
            )) : <tr><td colSpan={7} className="px-4 py-12 text-center"><div className="space-y-2"><p className="text-2xl filter brightness-0 invert">🔍</p><p className="text-white font-semibold">No guardians found</p><p className="text-slate-400 text-sm">Try adjusting filters</p></div></td></tr>}
          </tbody>
        </table>
      </div>

      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-[99999] p-4 overflow-y-auto" onClick={closeModal}>
          <div className="bg-gradient-to-br from-slate-800/98 to-slate-900/98 rounded-3xl p-6 sm:p-10 border-4 border-purple-500 shadow-2xl w-full max-w-5xl my-auto" onClick={e => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/30">
                <h2 className="text-2xl sm:text-4xl font-bold text-white flex items-center gap-3"><span className="text-4xl filter brightness-0 invert">{editingAdmin ? '✏️' : '➕'}</span>{editingAdmin ? 'Edit Guardian' : 'Add Guardian'}</h2>
                <button onClick={closeModal} className="text-white hover:text-slate-300 text-4xl leading-none">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-semibold text-slate-300 mb-2 uppercase">Email</label><input type="email" placeholder="email@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-blue-900/30 border-2 border-purple-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" required /></div>
                  <div><label className="block text-sm font-semibold text-slate-300 mb-2 uppercase">User ID {isUserIdLocked() && <span className="text-xs text-slate-400">(Locked)</span>}</label><input type="text" placeholder="User ID" value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} readOnly={isUserIdLocked()} disabled={isUserIdLocked()} className={`w-full px-4 py-3 border-2 rounded-xl text-white placeholder-slate-500 focus:outline-none ${isUserIdLocked() ? 'bg-slate-700/50 border-slate-600 cursor-not-allowed opacity-60' : 'bg-blue-900/30 border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'}`} required /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-semibold text-slate-300 mb-2 uppercase">Access Level</label><select value={formData.accesslevel} onChange={e => handleAccessLevelChange(Number(e.target.value))} className="w-full px-4 py-3 bg-blue-900/30 border-2 border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" required>{getAvailableAccessLevels().map(l => <option key={l.value} value={l.value} className="bg-white text-slate-900">{l.icon} {l.label}</option>)}</select></div>
                  <div><label className="block text-sm font-semibold text-slate-300 mb-2 uppercase">Club/Society {lockedSociety && !editingAdmin && <span className="text-xs text-slate-400">(Locked)</span>}</label>{lockedSociety && !editingAdmin ? <input type="text" value={formData.clubsoc} readOnly disabled className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-slate-300 cursor-not-allowed opacity-60 focus:outline-none" /> : <select value={formData.clubsoc} onChange={e => setFormData({ ...formData, clubsoc: e.target.value })} className="w-full px-4 py-3 bg-blue-900/30 border-2 border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" required><option value="" className="bg-white text-slate-900">Select Club/Society</option>{CLUBS_SOCS.map(c => <option key={c} value={c} className="bg-white text-slate-900">{c}</option>)}</select>}</div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-900/20 rounded-xl border-2 border-purple-500/30 hover:border-purple-500/50 cursor-pointer"><input type="checkbox" id="verified" checked={formData.verified} onChange={e => setFormData({ ...formData, verified: e.target.checked })} className="w-5 h-5 cursor-pointer accent-purple-500" /><label htmlFor="verified" className="text-white font-semibold cursor-pointer">✓ Mark as Blessed</label></div>
                <div className="flex gap-4 mt-8 pt-4 border-t border-purple-500/20">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-purple-500/50 text-lg">{editingAdmin ? '💾 Update' : '➕ Add'}</button>
                  <button type="button" onClick={closeModal} className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-4 px-6 rounded-xl text-lg">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
        </>
      )}
    </div>
  );
}