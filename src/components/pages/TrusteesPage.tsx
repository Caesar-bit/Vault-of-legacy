import { useEffect, useState } from 'react';
import {
  User,
  UserCheck,
  Gavel,
  Gift,
  Mail,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchTrustees, addTrustee, removeTrustee } from '../../utils/api';
import { AnimatedAlert } from '../AnimatedAlert';

interface TrusteeItem {
  id: string;
  name: string;
  email: string;
  tier: string;
  verified: boolean;
}

export function TrusteesPage() {
  const { token, isAuthenticated } = useAuth();
  const [trustees, setTrustees] = useState<TrusteeItem[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('reviewer');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    load();
  }, [isAuthenticated, token]);

  const load = async () => {
    try {
      const data = await fetchTrustees(token!);
      setTrustees(data);
    } catch (e) {
      console.error(e);
    }
  };

  const onAdd = async () => {
    if (!token) return;
    try {
      await addTrustee(token, { name, email, tier });
      setName('');
      setEmail('');
      setTier('reviewer');
      setAlert('Trustee added');
      load();
    } catch (e) {
      console.error(e);
      setAlert('Failed to add trustee');
    }
  };

  const onRemove = async (id: string) => {
    if (!token) return;
    try {
      await removeTrustee(token, id);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const counts = {
    reviewer: trustees.filter((t) => t.tier === 'reviewer').length,
    executor: trustees.filter((t) => t.tier === 'executor').length,
    recipient: trustees.filter((t) => t.tier === 'recipient').length,
    verified: trustees.filter((t) => t.verified).length,
  };

  const getTierColor = (value: string) => {
    switch (value) {
      case 'reviewer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'executor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'recipient':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTrustees = trustees.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTier = filterTier === 'all' || t.tier === filterTier;
    return matchSearch && matchTier;
  });

  return (
    <div className="space-y-8">
      {alert && (
        <AnimatedAlert message={alert} type="success" onClose={() => setAlert(null)} />
      )}

      {/* Header */}
      <div
        className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-10 pb-8 rounded-3xl bg-white/60 backdrop-blur-lg shadow-xl border border-white/30 overflow-hidden"
        style={{ background: 'linear-gradient(120deg,rgba(59,130,246,0.10),rgba(236,72,153,0.10) 100%)' }}
      >
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm tracking-tight">Trustees</h1>
          <p className="mt-2 text-lg text-gray-700">Manage estate contacts and permissions</p>
        </div>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl animate-pulse z-0" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl animate-pulse z-0" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: <UserCheck className="h-7 w-7 text-blue-600" />, label: 'Reviewers', value: counts.reviewer, color: 'from-blue-100 to-blue-50' },
          { icon: <Gavel className="h-7 w-7 text-purple-600" />, label: 'Executors', value: counts.executor, color: 'from-purple-100 to-purple-50' },
          { icon: <Gift className="h-7 w-7 text-green-600" />, label: 'Recipients', value: counts.recipient, color: 'from-green-100 to-green-50' },
          { icon: <CheckCircle className="h-7 w-7 text-teal-600" />, label: 'Verified', value: counts.verified, color: 'from-teal-100 to-teal-50' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl border border-white/40 shadow flex items-center space-x-4 glassy-card animate-fade-in`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="p-3 bg-white/60 rounded-xl shadow">{stat.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Trustee */}
      <div className="glassy-card p-6 rounded-3xl border border-white/30 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Add Trustee</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="border rounded px-3 py-2 flex-1 bg-white/80"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 flex-1 bg-white/80"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2 bg-white/80"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
          >
            <option value="reviewer">Reviewer</option>
            <option value="executor">Executor</option>
            <option value="recipient">Recipient</option>
          </select>
          <button
            onClick={onAdd}
            className="bg-primary-600 text-white rounded px-4 py-2"
          >
            Add
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white/70 p-6 rounded-3xl border border-white/30 shadow-xl backdrop-blur-lg flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search trustees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 border border-gray-200 rounded-xl w-full bg-white/80 shadow focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white/80 shadow"
        >
          <option value="all">All Tiers</option>
          <option value="reviewer">Reviewer</option>
          <option value="executor">Executor</option>
          <option value="recipient">Recipient</option>
        </select>
      </div>

      {/* Trustees List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrustees.map((t) => (
          <div
            key={t.id}
            className="glassy-card rounded-2xl border border-white/30 p-5 shadow-lg backdrop-blur-lg relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-400/10 rounded-full blur-xl" />
            <div className="flex items-center space-x-3 mb-2 relative z-10">
              <div className="p-2 bg-white/60 rounded-xl shadow">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t.name}</h3>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-3 relative z-10">
              <Mail className="h-4 w-4 mr-1" /> {t.email}
            </div>
            <div className="flex items-center justify-between relative z-10">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getTierColor(t.tier)}`}>{t.tier}</span>
              <div className="flex items-center space-x-2">
                {t.verified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <button
                  onClick={() => onRemove(t.id)}
                  className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom card styles */}
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
