import React, { useState } from 'react';
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

const mockUsers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-20T10:30:00Z',
    joinDate: '2023-01-15',
    permissions: ['read', 'write', 'delete', 'admin'],
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100'
  },
  {
    id: '2',
    name: 'Mary Johnson',
    email: 'mary.johnson@email.com',
    role: 'editor',
    status: 'active',
    lastLogin: '2024-01-19T15:45:00Z',
    joinDate: '2023-03-20',
    permissions: ['read', 'write'],
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100'
  },
  {
    id: '3',
    name: 'Robert Wilson',
    email: 'robert.wilson@email.com',
    role: 'contributor',
    status: 'pending',
    lastLogin: null,
    joinDate: '2024-01-18',
    permissions: ['read'],
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100'
  },
  {
    id: '4',
    name: 'Sarah Davis',
    email: 'sarah.davis@email.com',
    role: 'viewer',
    status: 'inactive',
    lastLogin: '2023-12-15T09:20:00Z',
    joinDate: '2023-06-10',
    permissions: ['read'],
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100'
  }
];

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
          { icon: <Users className="h-7 w-7 text-blue-600" />, label: 'Total Users', value: mockUsers.length, color: 'from-blue-100 to-blue-50' },
          { icon: <CheckCircle className="h-7 w-7 text-green-600" />, label: 'Active', value: mockUsers.filter(u => u.status === 'active').length, color: 'from-green-100 to-green-50' },
          { icon: <Clock className="h-7 w-7 text-yellow-600" />, label: 'Pending', value: mockUsers.filter(u => u.status === 'pending').length, color: 'from-yellow-100 to-yellow-50' },
          { icon: <Crown className="h-7 w-7 text-red-600" />, label: 'Admins', value: mockUsers.filter(u => u.role === 'admin').length, color: 'from-red-100 to-red-50' },
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
          {mockUsers.map((user) => {
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
                      <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition" onClick={e => e.stopPropagation()}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition" onClick={e => e.stopPropagation()}>
                        <Key className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition" onClick={e => e.stopPropagation()}>
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
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowInviteModal(false)}>
              <Trash2 className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Invite New User</h2>
            <form className="space-y-4">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Name" />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Email" />
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                <option value="">Select Role</option>
                {roles.map(role => <option key={role.value} value={role.value}>{role.name}</option>)}
              </select>
              <div className="flex space-x-2">
                <button type="button" className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200" onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Quick View Modal (UI only) */}
      {showProfileModal && (() => {
        const user = mockUsers.find(u => u.id === showProfileModal);
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
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50">
              <Mail className="h-4 w-4 mr-1" />
              Send Message
            </button>
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50">
              <Shield className="h-4 w-4 mr-1" />
              Change Role
            </button>
            <button className="inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm font-semibold text-red-700 bg-white hover:bg-red-50">
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