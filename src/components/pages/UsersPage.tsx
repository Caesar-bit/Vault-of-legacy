import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  User,
  Eye,
  Settings,
  Key
} from 'lucide-react';
import { fetchUsers, createUser, updateUser, removeUser } from '../../utils/users';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'contributor' | 'viewer';
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  lastLogin: string | null;
  joinDate: string;
  permissions: string[];
  avatar: string;
}


const roles = [
  {
    name: 'Admin',
    value: 'admin',
    description: 'Full access to all features and settings',
    permissions: ['read', 'write', 'delete', 'admin', 'user_management'],
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  {
    name: 'Editor',
    value: 'editor',
    description: 'Can create, edit, and manage content',
    permissions: ['read', 'write', 'delete'],
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    name: 'Contributor',
    value: 'contributor',
    description: 'Can add content and make suggestions',
    permissions: ['read', 'write'],
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    name: 'Viewer',
    value: 'viewer',
    description: 'Read-only access to content',
    permissions: ['read'],
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }
];

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showProfileModal, setShowProfileModal] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (e) {
        console.error(e);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'pending': return Clock;
      case 'inactive': return XCircle;
      case 'suspended': return AlertTriangle;
      default: return XCircle;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'editor': return Edit;
      case 'contributor': return UserPlus;
      case 'viewer': return Eye;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    const roleData = roles.find(r => r.value === role);
    return roleData?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const openEdit = (user: UserItem) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role });
    setShowInviteModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this user?')) {
      try {
        await removeUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setSelectedUsers((prev) => prev.filter((uid) => uid !== id));
      } catch (err) {
        console.error(err);
        alert('Failed to remove user');
      }
    }
  };

  const resetPassword = (user: UserItem) => {
    alert(`Password reset link sent to ${user.email}`);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleInfo = roles.find((r) => r.value === form.role);
    const newUser: UserItem = {
      id: editingId ?? Date.now().toString(),
      name: form.name,
      email: form.email,
      role: form.role as UserItem['role'],
      status: editingId ? users.find((u) => u.id === editingId)!.status : 'pending',
      lastLogin: editingId ? users.find((u) => u.id === editingId)!.lastLogin : null,
      joinDate: editingId ? users.find((u) => u.id === editingId)!.joinDate : new Date().toISOString().split('T')[0],
      permissions: roleInfo?.permissions ?? ['read'],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.name)}`,
    };

    try {
      if (editingId) {
        await updateUser(editingId, newUser);
        setUsers((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...newUser } : u)));
      } else {
        await createUser(newUser);
        setUsers((prev) => [newUser, ...prev]);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save user');
    }
    setEditingId(null);
    setForm({ name: '', email: '', role: 'viewer' });
    setShowInviteModal(false);
  };

  const sendBulkMessage = () => {
    const names = users.filter((u) => selectedUsers.includes(u.id)).map((u) => u.name).join(', ');
    alert(`Message sent to: ${names}`);
  };

  const bulkChangeRole = async () => {
    const role = prompt('Enter new role (admin, editor, contributor, viewer):', 'viewer');
    if (!role) return;
    try {
      await Promise.all(selectedUsers.map(id => updateUser(id, { role: role as UserItem['role'] })));
      setUsers((prev) => prev.map((u) => (selectedUsers.includes(u.id) ? { ...u, role } : u)));
    } catch (err) {
      console.error(err);
      alert('Failed to update roles');
    }
  };

  const bulkRemove = async () => {
    if (confirm('Remove selected users?')) {
      try {
        await Promise.all(selectedUsers.map(id => removeUser(id)));
        setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.id)));
        setSelectedUsers([]);
      } catch (err) {
        console.error(err);
        alert('Failed to remove users');
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="relative min-h-screen pb-24">
      {/* Animated Glassy Hero */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-10 pb-8 mb-6 rounded-3xl bg-white/60 backdrop-blur-lg shadow-xl border border-white/30 overflow-hidden" style={{background: 'linear-gradient(120deg,rgba(59,130,246,0.08),rgba(236,72,153,0.08) 100%)'}}>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">User Management</h1>
          <p className="mt-2 text-lg text-gray-700">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="mt-6 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white/80 hover:bg-blue-50 shadow transition">
            <Settings className="h-4 w-4 mr-2" />
            Permissions
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-pink-500 shadow-lg hover:scale-105 hover:shadow-xl transition"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </button>
        </div>
        {/* Animated background blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl animate-pulse z-0" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl animate-pulse z-0" />
      </div>

      {/* Animated Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { icon: <Users className="h-7 w-7 text-blue-600" />, label: 'Total Users', value: users.length, color: 'from-blue-100 to-blue-50' },
          { icon: <CheckCircle className="h-7 w-7 text-green-600" />, label: 'Active', value: users.filter(u => u.status === 'active').length, color: 'from-green-100 to-green-50' },
          { icon: <Clock className="h-7 w-7 text-yellow-600" />, label: 'Pending', value: users.filter(u => u.status === 'pending').length, color: 'from-yellow-100 to-yellow-50' },
          { icon: <Crown className="h-7 w-7 text-red-600" />, label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'from-red-100 to-red-50' },
        ].map((stat, i) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl border border-white/40 shadow flex items-center space-x-4 glassy-card animate-fade-in`} style={{animationDelay: `${i * 80}ms`}}>
            <div className="p-3 bg-white/60 rounded-xl shadow">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Roles Overview */}
      <div className="bg-white/70 rounded-3xl border border-white/30 p-6 mb-6 shadow-xl backdrop-blur-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">User Roles & Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((role) => {
            const RoleIcon = getRoleIcon(role.value);
            return (
              <div key={role.value} className="glassy-card border border-white/40 rounded-2xl p-5 shadow-lg hover:scale-[1.03] hover:shadow-2xl transition group relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-400/10 rounded-full blur-xl group-hover:scale-125 transition" />
                <div className="flex items-center space-x-3 mb-2 relative z-10">
                  <div className="p-2 bg-white/60 rounded-xl shadow">
                    <RoleIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${role.color}`}>{role.name}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 relative z-10">{role.description}</p>
                <div className="space-y-1 relative z-10">
                  {role.permissions.map((permission) => (
                    <div key={permission} className="flex items-center text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      {permission.replace('_', ' ')}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 p-6 rounded-3xl border border-white/30 shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 backdrop-blur-lg">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 shadow"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 shadow"
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>{role.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 shadow"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {/* Floating filter button for mobile */}
        <button className="sm:hidden fixed bottom-24 right-6 z-30 bg-gradient-to-r from-blue-600 to-pink-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition">
          <Filter className="h-6 w-6" />
        </button>
      </div>

      {/* Interactive Users List */}
      <div className="bg-white/70 rounded-3xl border border-white/30 shadow-xl backdrop-blur-lg">
        <div className="px-6 py-4 border-b border-white/30">
          <h3 className="text-lg font-bold text-gray-900">Users</h3>
        </div>
        <div className="divide-y divide-white/30">
          {filteredUsers.map((user) => {
            const StatusIcon = getStatusIcon(user.status);
            const RoleIcon = getRoleIcon(user.role);
            return (
              <div key={user.id} className="p-6 hover:bg-blue-50/20 transition cursor-pointer group" onClick={() => setShowProfileModal(user.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onClick={e => e.stopPropagation()}
                    />
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow group-hover:scale-105 transition"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition">{user.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <RoleIcon className="h-4 w-4 text-gray-400" />
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>{user.role}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StatusIcon className="h-4 w-4 text-gray-400" />
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(user.status)}`}>{user.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {user.joinDate}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        Last login: {formatLastLogin(user.lastLogin)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(user);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetPassword(user);
                        }}
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(user.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition" onClick={e => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Invite Button */}
      <button
        onClick={() => setShowInviteModal(true)}
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-blue-600 to-pink-500 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition flex items-center justify-center animate-bounce"
        title="Invite User"
      >
        <UserPlus className="h-7 w-7" />
      </button>

      {/* Invite User Modal (UI only) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => { setShowInviteModal(false); setEditingId(null); }}>
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900">{editingId ? 'Edit User' : 'Invite New User'}</h2>
            <form className="space-y-4" onSubmit={handleInviteSubmit}>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.name}
                  </option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button type="button" className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200" onClick={() => { setShowInviteModal(false); setEditingId(null); }}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
                  {editingId ? 'Save' : 'Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Quick View Modal (UI only) */}
      {showProfileModal && (() => {
        const user = users.find(u => u.id === showProfileModal);
        if (!user) return null;
        const StatusIcon = getStatusIcon(user.status);
        const RoleIcon = getRoleIcon(user.role);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowProfileModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in" onClick={e => e.stopPropagation()}>
              <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowProfileModal(null)}>
                <Trash2 className="h-5 w-5" />
              </button>
              <div className="flex flex-col items-center mb-4">
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-blue-200 shadow mb-2" />
                <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                <span className="text-sm text-gray-500">{user.email}</span>
                <div className="flex items-center space-x-2 mt-2">
                  <RoleIcon className="h-4 w-4 text-gray-400" />
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>{user.role}</span>
                  <StatusIcon className="h-4 w-4 text-gray-400" />
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(user.status)}`}>{user.status}</span>
                </div>
              </div>
              <div className="mb-2 text-sm text-gray-700">
                <div className="flex items-center mb-1"><Calendar className="h-4 w-4 mr-1" />Joined {user.joinDate}</div>
                <div className="flex items-center"><Clock className="h-4 w-4 mr-1" />Last login: {formatLastLogin(user.lastLogin)}</div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map(p => (
                    <span key={p} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 border border-white/30 rounded-xl shadow-2xl p-4 z-50 flex items-center space-x-4 animate-fade-in">
          <span className="text-sm font-semibold text-gray-700">
            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-2">
            <button
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
              onClick={sendBulkMessage}
            >
              <Mail className="h-4 w-4 mr-1" />
              Send Message
            </button>
            <button
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
              onClick={bulkChangeRole}
            >
              <Shield className="h-4 w-4 mr-1" />
              Change Role
            </button>
            <button
              className="inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm font-semibold text-red-700 bg-white hover:bg-red-50"
              onClick={bulkRemove}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Custom styles for glassy/animated cards */}
      <style>{`
        .glassy-card {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
}