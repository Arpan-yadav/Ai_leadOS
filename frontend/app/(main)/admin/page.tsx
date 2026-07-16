'use client';
import React, { useState, useEffect } from 'react';
import {
  Users, Shield, Trash2, Key, Crown, UserCheck,
  Loader2, Search, MoreVertical, AlertTriangle,
  BarChart3, Database, Zap, GitBranch, CheckCircle2
} from 'lucide-react';
import { getToken } from '@/lib/auth';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  ADMIN:     { label: 'Admin',     color: 'text-[#ff007a] bg-[#ff007a]/10 border-[#ff007a]/20' },
  MANAGER:   { label: 'Manager',   color: 'text-[#bd00ff] bg-[#bd00ff]/10 border-[#bd00ff]/20' },
  EXECUTIVE: { label: 'Executive', color: 'text-[#00f0ff] bg-[#00f0ff]/10 border-[#00f0ff]/20' },
};

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-[10px] text-[#b9cacb] uppercase tracking-widest font-bold">{label}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [search, setSearch] = useState('');
  const [roleMenuOpen, setRoleMenuOpen] = useState<string | null>(null);
  const [resetPwd, setResetPwd] = useState<{ userId: string; name: string } | null>(null);
  const [newPwd, setNewPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const token = getToken();

  const fetchAll = async () => {
    setLoading(true);
    setAccessDenied(false);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (usersRes.status === 403 || statsRes.status === 403) {
        setAccessDenied(true);
        return;
      }
      if (usersRes.ok) setUsers(await usersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateRole = async (userId: string, role: string) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      if (res.ok) { toast.success(`Role updated to ${role}`); setUsers(u => u.map(x => x.id === userId ? { ...x, role } : x)); }
      else toast.error('Failed to update role');
    } catch { toast.error('Network error'); } finally { setSaving(false); setRoleMenuOpen(null); }
  };

  const deleteUser = async (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { toast.success(`${name} deleted`); setUsers(u => u.filter(x => x.id !== userId)); }
      else toast.error('Failed to delete user');
    } catch { toast.error('Network error'); }
  };

  const submitResetPwd = async () => {
    if (!resetPwd || newPwd.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/users/${resetPwd.userId}/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: newPwd }),
      });
      if (res.ok) { toast.success(`Password reset for ${resetPwd.name}`); setResetPwd(null); setNewPwd(''); }
      else toast.error('Failed to reset password');
    } catch { toast.error('Network error'); } finally { setSaving(false); }
  };

  const filtered = users.filter(u =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <Shield size={24} className="text-rose-400" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-black text-white uppercase tracking-widest">Access Denied</h2>
          <p className="text-[12px] text-[#b9cacb] mt-2 max-w-sm">
            Your current role is <span className="text-[#00f0ff] font-bold">EXECUTIVE</span>. The Admin Panel requires <span className="text-[#ff007a] font-bold">ADMIN</span> or <span className="text-[#bd00ff] font-bold">MANAGER</span> role.
          </p>
          <p className="text-[11px] text-[#b9cacb] mt-2">Ask an admin to update your role via this same panel, or run this in your backend to promote yourself:</p>
          <code className="block mt-2 p-2 bg-[#0A0A0C] border border-[#27272A] rounded-lg text-[10px] text-[#00f0ff] font-mono text-left">
            npx prisma studio → User → change role to ADMIN
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-white tracking-tight uppercase flex items-center gap-2">
          <Shield size={22} className="text-[#ff007a]" />
          Admin Panel
        </h1>
        <p className="text-[#b9cacb] mt-1 font-mono text-[11px] uppercase tracking-wider">
          User management · System overview · Role control
        </p>
      </header>

      {/* System Stats */}
      {loading ? (
        <div className="flex items-center gap-2 text-[#b9cacb]"><Loader2 size={16} className="animate-spin" /> Loading stats...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Users}     label="Users"     value={stats?.users}     color="bg-[#00f0ff]/10 text-[#00f0ff]" />
          <StatCard icon={UserCheck} label="Leads"     value={stats?.leads}     color="bg-[#bd00ff]/10 text-[#bd00ff]" />
          <StatCard icon={BarChart3} label="Deals"     value={stats?.deals}     color="bg-emerald-500/10 text-emerald-400" />
          <StatCard icon={Zap}       label="Workflows" value={stats?.workflows} color="bg-amber-500/10 text-amber-400" />
          <StatCard icon={GitBranch} label="Sequences" value={stats?.sequences} color="bg-[#ff007a]/10 text-[#ff007a]" />
          <StatCard icon={Database}  label="Revenue"   value={`$${((stats?.wonRevenue || 0) / 1000).toFixed(1)}k`} color="bg-green-500/10 text-green-400" />
        </div>
      )}

      {/* User Management Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">User Management</h2>
            <p className="text-[10px] text-[#b9cacb] mt-0.5">{users.length} users in the system</p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b9cacb]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="input-field pl-8 text-xs w-52"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-[#b9cacb]">
            <Loader2 size={18} className="animate-spin" /> Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#27272A]">
                  {['User', 'Role', 'Leads', 'Deals', 'Activities', 'Tasks', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[10px] font-black text-[#b9cacb] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {filtered.map(user => {
                  const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.EXECUTIVE;
                  return (
                    <tr key={user.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#00f0ff]/20 to-[#bd00ff]/20 border border-[#00f0ff]/20 flex items-center justify-center text-[10px] font-bold text-[#00f0ff]">
                            {user.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{user.name}</p>
                            <p className="text-[10px] text-[#b9cacb]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${role.color}`}>
                          {user.role === 'ADMIN' && <Crown size={9} />}
                          {role.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-mono">{user._count?.leads ?? 0}</td>
                      <td className="px-6 py-4 text-sm text-white font-mono">{user._count?.deals ?? 0}</td>
                      <td className="px-6 py-4 text-sm text-white font-mono">{user._count?.activities ?? 0}</td>
                      <td className="px-6 py-4 text-sm text-white font-mono">{user._count?.tasks ?? 0}</td>
                      <td className="px-6 py-4 text-[11px] text-[#b9cacb]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 relative">
                          {/* Role changer */}
                          <div className="relative">
                            <button
                              onClick={() => setRoleMenuOpen(roleMenuOpen === user.id ? null : user.id)}
                              className="p-1.5 rounded-lg text-[#b9cacb] hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors"
                              title="Change role"
                            >
                              <Shield size={13} />
                            </button>
                            {roleMenuOpen === user.id && (
                              <div className="absolute right-0 top-full mt-1 z-50 glass-card py-1 w-36 shadow-xl">
                                {Object.keys(ROLE_CONFIG).map(r => (
                                  <button
                                    key={r}
                                    onClick={() => updateRole(user.id, r)}
                                    className={`w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-white/5 flex items-center gap-2 ${ROLE_CONFIG[r].color.split(' ')[0]}`}
                                  >
                                    {r === user.role && <CheckCircle2 size={10} />}
                                    {ROLE_CONFIG[r].label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Reset password */}
                          <button
                            onClick={() => setResetPwd({ userId: user.id, name: user.name })}
                            className="p-1.5 rounded-lg text-[#b9cacb] hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            title="Reset password"
                          >
                            <Key size={13} />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => deleteUser(user.id, user.name)}
                            className="p-1.5 rounded-lg text-[#b9cacb] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-[#b9cacb] text-sm">No users found</div>
            )}
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-sm">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Reset Password</h3>
            <p className="text-[11px] text-[#b9cacb] mb-4">Set a new password for <span className="text-white font-bold">{resetPwd.name}</span></p>
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="New password (min 8 chars)"
              className="input-field w-full mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => { setResetPwd(null); setNewPwd(''); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={submitResetPwd} disabled={saving || newPwd.length < 8} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Key size={13} />}
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
