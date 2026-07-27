'use client';
import React, { useState, useEffect } from 'react';
import {
  Users, Shield, Trash2, Key, Crown, UserCheck,
  Loader2, Search, BarChart3, Database, Zap, GitBranch, CheckCircle2,
  Lock, Settings, Eye, Plus, LayoutDashboard, UserPlus, Copy, Link, Edit2
} from 'lucide-react';
import { getToken } from '@/lib/auth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'ROLES' | 'TENANTS'>('OVERVIEW');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTenantDetails, setActiveTenantDetails] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [roleMenuOpen, setRoleMenuOpen] = useState<string | null>(null);
  const [resetPwd, setResetPwd] = useState<{ userId: string; name: string } | null>(null);
  const [newPwd, setNewPwd] = useState('');
  const [saving, setSaving] = useState(false);
  
  // New Role Modal state
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', manageUsers: false, manageSettings: false, viewAllLeads: false, deleteData: false });

  // Invite Member state
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  const generateInvite = async () => {
    setInviteLoading(true);
    try {
      const res = await fetch(`${API}/auth/invite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setInviteUrl(data.inviteUrl);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard!');
  };

  
  const token = getToken();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [meRes, usersRes, statsRes, rolesRes] = await Promise.all([
        fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/admin/roles`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      let isSuperAdmin = false;
      if (meRes.ok) {
        const me = await meRes.json();
        setCurrentUser(me);
        isSuperAdmin = me.isSuperAdmin;
      }
      
      if (usersRes.ok) setUsers(await usersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());

      if (isSuperAdmin) {
        const tenantsRes = await fetch(`${API}/admin/tenants`, { headers: { Authorization: `Bearer ${token}` } });
        if (tenantsRes.ok) setTenants(await tenantsRes.json());
      }
    } catch (e) {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateRole = async (userId: string, roleId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roleId }),
      });
      if (res.ok) {
        const updated = await res.json();
        toast.success(`Role updated successfully`);
        setUsers(u => u.map(x => x.id === userId ? { ...x, role: updated.user.role } : x));
      } else toast.error('Failed to update role');
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
      else { const d = await res.json(); toast.error(d.message || 'Failed to delete user'); }
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

  const submitCreateRole = async () => {
    if (!newRole.name.trim()) return toast.error('Role name is required');
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newRole.name,
          permissions: {
            manageUsers: newRole.manageUsers,
            manageSettings: newRole.manageSettings,
            viewAllLeads: newRole.viewAllLeads,
            deleteData: newRole.deleteData
          }
        }),
      });
      if (res.ok) {
        const role = await res.json();
        setRoles([...roles, role]);
        toast.success('Role created');
        setCreateRoleModal(false);
        setNewRole({ name: '', manageUsers: false, manageSettings: false, viewAllLeads: false, deleteData: false });
      } else toast.error('Failed to create role');
    } catch { toast.error('Network error'); } finally { setSaving(false); }
  };

  const deleteRole = async (roleId: string, name: string) => {
    if (!confirm(`Delete role "${name}"?`)) return;
    try {
      const res = await fetch(`${API}/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { toast.success(`${name} deleted`); setRoles(r => r.filter(x => x.id !== roleId)); }
      else { const d = await res.json(); toast.error(d.message || 'Failed to delete role'); }
    } catch { toast.error('Network error'); }
  };

  const filteredUsers = users.filter(u =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const updateTenant = async (tenantId: string, oldName: string) => {
    const newName = prompt(`Enter new name for "${oldName}":`, oldName);
    if (!newName || newName === oldName) return;
    try {
      const res = await fetch(`${API}/admin/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        toast.success('Tenant updated');
        setTenants(tenants.map(t => t.id === tenantId ? { ...t, name: newName } : t));
        if (activeTenantDetails?.tenant.id === tenantId) setActiveTenantDetails({...activeTenantDetails, tenant: { ...activeTenantDetails.tenant, name: newName }});
      } else toast.error('Failed to update tenant');
    } catch { toast.error('Network error'); }
  };

  const deleteTenant = async (tenantId: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete the tenant "${name}" and ALL its data?`)) return;
    try {
      const res = await fetch(`${API}/admin/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Tenant deleted');
        setTenants(tenants.filter(t => t.id !== tenantId));
        if (activeTenantDetails?.tenant.id === tenantId) setActiveTenantDetails(null);
      } else {
        const d = await res.json();
        toast.error(d.message || 'Failed to delete tenant');
      }
    } catch { toast.error('Network error'); }
  };

  const fetchTenantDetails = async (tenantId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/tenants/${tenantId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTenantDetails(data);
      } else {
        toast.error('Failed to load tenant details');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase flex items-center gap-2">
            <Crown size={22} className="text-[#ff007a]" />
            {currentUser?.isSuperAdmin ? 'Supreme Admin Panel' : 'Workspace Admin Panel'}
          </h1>
          <p className="text-[#b9cacb] mt-1 font-mono text-[11px] uppercase tracking-wider">
            Full system control · Custom Roles · Advanced Security
          </p>
        </div>
        
        <div className="flex bg-[#0A0A0C] border border-[#27272A] rounded-xl p-1">
          <button onClick={() => setActiveTab('OVERVIEW')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'OVERVIEW' ? 'bg-[#ff007a]/10 text-[#ff007a]' : 'text-[#b9cacb] hover:text-white'}`}>
            <LayoutDashboard size={14} /> Overview
          </button>
          <button onClick={() => setActiveTab('USERS')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'USERS' ? 'bg-[#00f0ff]/10 text-[#00f0ff]' : 'text-[#b9cacb] hover:text-white'}`}>
            <Users size={14} /> Users
          </button>
          <button onClick={() => setActiveTab('ROLES')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'ROLES' ? 'bg-[#bd00ff]/10 text-[#bd00ff]' : 'text-[#b9cacb] hover:text-white'}`}>
            <Shield size={14} /> Roles
          </button>
          {currentUser?.isSuperAdmin && (
            <button onClick={() => setActiveTab('TENANTS')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'TENANTS' ? 'bg-[#00ff9d]/10 text-[#00ff9d]' : 'text-[#b9cacb] hover:text-white'}`}>
              <Database size={14} /> Tenants
            </button>
          )}
        </div>
      </header>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <>
          {loading ? (
            <div className="flex items-center gap-2 text-[#b9cacb]"><Loader2 size={16} className="animate-spin" /> Loading stats...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Users}     label="Users"     value={stats?.users}     color="bg-[#00f0ff]/10 text-[#00f0ff]" />
              <StatCard icon={UserCheck} label="Leads"     value={stats?.leads}     color="bg-[#bd00ff]/10 text-[#bd00ff]" />
              <StatCard icon={BarChart3} label="Deals"     value={stats?.deals}     color="bg-emerald-500/10 text-emerald-400" />
              <StatCard icon={Database}  label="Tenants"   value={stats?.tenants}   color="bg-[#00ff9d]/10 text-[#00ff9d]" />
              <StatCard icon={GitBranch} label="Sequences" value={stats?.sequences} color="bg-[#ff007a]/10 text-[#ff007a]" />
              <StatCard icon={Zap}       label="Revenue"   value={`$${((stats?.wonRevenue || 0) / 1000).toFixed(1)}k`} color="bg-amber-500/10 text-amber-400" />
            </div>
          )}
        </>
      )}

      {/* USERS TAB */}
      {activeTab === 'USERS' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">User Management</h2>
              <p className="text-[10px] text-[#b9cacb] mt-0.5">{users.length} users in the system</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setInviteModal(true); setInviteUrl(''); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0077b6]/20 border border-[#0077b6]/40 text-[#00b4d8] hover:bg-[#0077b6]/30 transition-all"
              >
                <UserPlus size={13} /> Invite Member
              </button>
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
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-[#b9cacb]">
              <Loader2 size={18} className="animate-spin" /> Loading users...
            </div>
          ) : (
            <div className="overflow-visible pb-16">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#27272A]">
                    {['User', 'Role', 'Leads', 'Deals', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-[10px] font-black text-[#b9cacb] uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#00f0ff]/20 to-[#bd00ff]/20 border border-[#00f0ff]/20 flex items-center justify-center text-[10px] font-bold text-[#00f0ff]">
                            {user.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                              {user.name}
                              {user.isSuperAdmin && <span title="Supreme Admin"><Crown size={12} className="text-[#ff007a]" /></span>}
                            </p>
                            <p className="text-[10px] text-[#b9cacb]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border text-[#00f0ff] bg-[#00f0ff]/10 border-[#00f0ff]/20">
                          {user.role?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-mono">
                        <button 
                          onClick={() => router.push(`/leads?assignedToId=${user.id}`)}
                          className="hover:text-[#00f0ff] hover:underline cursor-pointer transition-colors"
                          title="View Leads added by this user"
                        >
                          {user._count?.leads ?? 0}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-mono">{user._count?.deals ?? 0}</td>
                      <td className="px-6 py-4 text-[11px] text-[#b9cacb]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 relative">
                          {/* Role changer */}
                          {!user.isSuperAdmin && (
                            <div className="relative">
                              <button
                                onClick={() => setRoleMenuOpen(roleMenuOpen === user.id ? null : user.id)}
                                className="p-1.5 rounded-lg text-[#b9cacb] hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors"
                                title="Assign Custom Role"
                              >
                                <Shield size={13} />
                              </button>
                              {roleMenuOpen === user.id && (
                                <div className="absolute right-0 top-full mt-1 z-50 glass-card py-1 w-48 shadow-xl max-h-48 overflow-y-auto">
                                  {roles.map(r => (
                                    <button
                                      key={r.id}
                                      onClick={() => updateRole(user.id, r.id)}
                                      className="w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-white/5 flex items-center gap-2 text-white"
                                    >
                                      {r.id === user.role?.id && <CheckCircle2 size={10} className="text-[#00f0ff]" />}
                                      {r.name} {r.isDefault && <span className="text-[9px] text-[#b9cacb]">(Def)</span>}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          {/* Reset password */}
                          <button
                            onClick={() => setResetPwd({ userId: user.id, name: user.name })}
                            className="p-1.5 rounded-lg text-[#b9cacb] hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            title="Reset password"
                          >
                            <Key size={13} />
                          </button>
                          {/* Delete */}
                          {!user.isSuperAdmin && (
                            <button
                              onClick={() => deleteUser(user.id, user.name)}
                              className="p-1.5 rounded-lg text-[#b9cacb] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* TENANTS TAB */}
      {activeTab === 'TENANTS' && (
        <>
          {activeTenantDetails ? (
            <div className="space-y-4">
              <button onClick={() => setActiveTenantDetails(null)} className="btn-secondary text-xs flex items-center gap-2 mb-2">
                ← Back to Tenants
              </button>
              <div className="glass-card p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">{activeTenantDetails.tenant.name}</h2>
                  <p className="text-xs text-[#b9cacb] mt-1">Tenant Overview</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-xs text-[#b9cacb] uppercase tracking-widest font-bold">Users</p>
                    <p className="text-xl font-mono font-bold text-[#00f0ff]">{activeTenantDetails.users.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#b9cacb] uppercase tracking-widest font-bold">Leads</p>
                    <p className="text-xl font-mono font-bold text-[#bd00ff]">{activeTenantDetails.leads.length}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#27272A]"><h3 className="text-sm font-bold text-white">Users</h3></div>
                  <div className="overflow-visible pb-24">
                    <table className="w-full">
                      <tbody className="divide-y divide-[#27272A]">
                        {activeTenantDetails.users.map((u: any) => (
                          <tr key={u.id}>
                            <td className="px-4 py-3">
                              <p className="text-sm font-bold text-white">{u.name}</p>
                              <p className="text-[10px] text-[#b9cacb]">{u.email}</p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-[#00f0ff]/10 text-[#00f0ff]">{u.role?.name || 'Unassigned'}</span>
                                {/* User Actions */}
                                <div className="relative flex gap-1">
                                  <div className="relative">
                                    <button
                                      onClick={() => setRoleMenuOpen(roleMenuOpen === u.id ? null : u.id)}
                                      className="p-1 rounded text-[#b9cacb] hover:text-[#00f0ff] transition-colors"
                                    >
                                      <Shield size={12} />
                                    </button>
                                    {roleMenuOpen === u.id && (
                                      <div className="absolute right-0 top-full mt-1 z-50 glass-card py-1 w-48 shadow-xl max-h-48 overflow-y-auto">
                                        {roles.map(r => (
                                          <button
                                            key={r.id}
                                            onClick={async () => {
                                              await updateRole(u.id, r.id);
                                              fetchTenantDetails(activeTenantDetails.tenant.id); // Refresh
                                            }}
                                            className="w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-white/5 flex items-center gap-2 text-white"
                                          >
                                            {r.id === u.role?.id && <CheckCircle2 size={10} className="text-[#00f0ff]" />}
                                            {r.name} {r.isDefault && <span className="text-[9px] text-[#b9cacb]">(Def)</span>}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => setResetPwd({ userId: u.id, name: u.name })}
                                    className="p-1 rounded text-[#b9cacb] hover:text-amber-400 transition-colors"
                                  >
                                    <Key size={12} />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await deleteUser(u.id, u.name);
                                      fetchTenantDetails(activeTenantDetails.tenant.id); // Refresh
                                    }}
                                    className="p-1 rounded text-[#b9cacb] hover:text-rose-400 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#27272A]"><h3 className="text-sm font-bold text-white">Recent Leads</h3></div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <tbody className="divide-y divide-[#27272A]">
                        {activeTenantDetails.leads.map((l: any) => (
                          <tr key={l.id}>
                            <td className="px-4 py-3">
                              <p className="text-sm font-bold text-white">{l.name}</p>
                              <p className="text-[10px] text-[#b9cacb]">{l.company}</p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${l.status === 'HOT' ? 'bg-rose-500/10 text-rose-400' : 'bg-[#b9cacb]/10 text-[#b9cacb]'}`}>{l.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Tenant Management</h2>
                  <p className="text-[10px] text-[#b9cacb] mt-0.5">{tenants.length} tenants across the platform</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b9cacb]" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search tenants..."
                      className="input-field pl-8 text-xs w-52"
                    />
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="p-8 flex items-center justify-center gap-2 text-[#b9cacb]">
                  <Loader2 size={18} className="animate-spin" /> Loading tenants...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#27272A]">
                        {['Tenant Name', 'Users', 'Leads', 'Deals', 'Created', ''].map(h => (
                          <th key={h} className="text-left px-6 py-3 text-[10px] font-black text-[#b9cacb] uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272A]">
                      {tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map(tenant => (
                        <tr key={tenant.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#00ff9d]/20 to-[#0077b6]/20 border border-[#00ff9d]/20 flex items-center justify-center text-[10px] font-bold text-[#00ff9d]">
                                {tenant.name.substring(0, 2).toUpperCase()}
                              </div>
                              <p className="text-sm font-bold text-white">{tenant.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-white font-mono">{tenant._count?.users ?? 0}</td>
                          <td className="px-6 py-4 text-sm text-white font-mono">{tenant._count?.leads ?? 0}</td>
                          <td className="px-6 py-4 text-sm text-white font-mono">{tenant._count?.Deal ?? 0}</td>
                          <td className="px-6 py-4 text-[11px] text-[#b9cacb]">
                            {new Date(tenant.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => fetchTenantDetails(tenant.id)} className="btn-secondary text-[10px] px-2 py-1 flex items-center gap-1 inline-flex">
                                <Eye size={10} /> View Details
                              </button>
                              <button onClick={() => updateTenant(tenant.id, tenant.name)} className="p-1.5 rounded text-[#b9cacb] hover:text-[#00f0ff] hover:bg-white/5 transition-colors" title="Rename Tenant">
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => deleteTenant(tenant.id, tenant.name)} className="p-1.5 rounded text-[#b9cacb] hover:text-rose-400 hover:bg-white/5 transition-colors" title="Delete Tenant">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ROLES TAB */}
      {activeTab === 'ROLES' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setCreateRoleModal(true)} className="btn-primary text-xs flex items-center gap-2 py-1.5 px-3">
              <Plus size={14} /> Create Custom Role
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(role => (
              <div key={role.id} className="glass-card p-5 relative group">
                {!role.isDefault && (
                  <button onClick={() => deleteRole(role.id, role.name)} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#b9cacb] hover:bg-rose-500/10 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#bd00ff]/10 border border-[#bd00ff]/20 flex items-center justify-center">
                    <Shield size={18} className="text-[#bd00ff]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{role.name}</h3>
                    {role.isDefault ? (
                      <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">System Default</span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-widest text-[#00f0ff] font-bold">Custom Role</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] text-[#b9cacb] uppercase tracking-widest font-black mb-2">Permissions</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#b9cacb] flex items-center gap-2"><Users size={12}/> Manage Users</span>
                    {role.permissions?.manageUsers ? <CheckCircle2 size={14} className="text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#27272A]"/>}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#b9cacb] flex items-center gap-2"><Settings size={12}/> Manage Settings</span>
                    {role.permissions?.manageSettings ? <CheckCircle2 size={14} className="text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#27272A]"/>}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#b9cacb] flex items-center gap-2"><Eye size={12}/> View All Leads</span>
                    {role.permissions?.viewAllLeads ? <CheckCircle2 size={14} className="text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#27272A]"/>}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#b9cacb] flex items-center gap-2"><Trash2 size={12}/> Delete Data</span>
                    {role.permissions?.deleteData ? <CheckCircle2 size={14} className="text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#27272A]"/>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {createRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Plus size={16} className="text-[#bd00ff]" />
              Create Custom Role
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#b9cacb] uppercase tracking-widest mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g. Content Writer"
                  className="input-field w-full"
                />
              </div>
              
              <div className="bg-[#0A0A0C] border border-[#27272A] rounded-xl p-4 space-y-3">
                <label className="block text-[10px] font-black text-[#ff007a] uppercase tracking-widest mb-2">Granular Permissions</label>
                
                {[
                  { key: 'manageUsers', label: 'Manage Users', icon: Users, desc: 'Add, remove, or modify employees' },
                  { key: 'manageSettings', label: 'Manage Settings', icon: Settings, desc: 'Change global tenant configurations' },
                  { key: 'viewAllLeads', label: 'View All Leads', icon: Eye, desc: 'Bypass assignment rules to see all' },
                  { key: 'deleteData', label: 'Delete Data', icon: Trash2, desc: 'Ability to permanently delete records' }
                ].map((perm) => (
                  <label key={perm.key} className="flex items-start gap-3 cursor-pointer group">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={(newRole as any)[perm.key]}
                        onChange={e => setNewRole({ ...newRole, [perm.key]: e.target.checked })}
                        className="rounded border-[#27272A] bg-black text-[#00f0ff] focus:ring-[#00f0ff] focus:ring-offset-black"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#00f0ff] transition-colors">{perm.label}</p>
                      <p className="text-[10px] text-[#b9cacb]">{perm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setCreateRoleModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={submitCreateRole} disabled={saving || !newRole.name.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card p-6 w-full max-w-sm">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Reset Password</h3>
            <p className="text-[11px] text-[#b9cacb] mb-4">Set a new password for <span className="text-white font-bold">{resetPwd.name}</span></p>
            <div className="relative mb-4">
              <input
                type={showPwd ? "text" : "password"}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="input-field w-full pr-10"
              />
              <button
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b9cacb] hover:text-[#00f0ff] transition-colors"
                type="button"
              >
                <Eye size={16} />
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setResetPwd(null); setNewPwd(''); setShowPwd(false); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={submitResetPwd} disabled={saving || newPwd.length < 8} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Key size={13} />}
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INVITE MEMBER MODAL ────────────────────────────────── */}
      {inviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 w-full max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#0077b6]/20 flex items-center justify-center">
                <UserPlus size={18} className="text-[#00b4d8]" />
              </div>
              <div>
                <h2 className="text-white font-black text-sm uppercase tracking-widest">Invite Team Member</h2>
                <p className="text-[#b9cacb] text-[11px]">Generate a link and share it — expires in 7 days</p>
              </div>
            </div>

            <div className="border-t border-[#27272A] my-5" />

            {!inviteUrl ? (
              <>
                <p className="text-[#b9cacb] text-sm mb-6">
                  Click below to generate a unique invite link. Anyone who opens it can register and join your workspace as a Member.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setInviteModal(false); }} className="btn-secondary flex-1">Cancel</button>
                  <button
                    onClick={generateInvite}
                    disabled={inviteLoading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {inviteLoading ? <Loader2 size={13} className="animate-spin" /> : <Link size={13} />}
                    {inviteLoading ? 'Generating...' : 'Generate Invite Link'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[#10b981] text-xs font-bold uppercase tracking-widest mb-3">✅ Invite link ready!</p>
                <div className="flex items-center gap-2 bg-[#0A0A0C] border border-[#27272A] rounded-xl p-3 mb-4">
                  <Link size={13} className="text-[#00b4d8] shrink-0" />
                  <span className="text-[#b9cacb] text-xs truncate flex-1 font-mono">{inviteUrl}</span>
                  <button
                    onClick={copyInvite}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0077b6]/20 text-[#00b4d8] text-xs font-bold hover:bg-[#0077b6]/30 transition-all"
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>
                <p className="text-[#b9cacb] text-xs mb-5">
                  Share this link via WhatsApp, email, or any messaging app. The invited person will register and automatically join your workspace.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setInviteModal(false); setInviteUrl(''); }} className="btn-secondary flex-1">Close</button>
                  <button
                    onClick={generateInvite}
                    disabled={inviteLoading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {inviteLoading ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                    Generate New Link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

