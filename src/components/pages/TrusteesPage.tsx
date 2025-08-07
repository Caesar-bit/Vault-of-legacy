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
  Pencil,
  Plus,
  Shield,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchTrustees,
  addTrustee,
  removeTrustee,
  updateTrustee,
  verifyTrustee,
} from '../../utils/api';
import { AddTrusteeModal } from '../AddTrusteeModal';
import { AnimatedAlert } from '../AnimatedAlert';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [alert, setAlert] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TrusteeItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTrustees, setSelectedTrustees] = useState<string[]>([]);

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

  const saveTrustee = async (data: { name: string; email: string; tier: string }) => {
    if (!token) return;
    try {
      if (editing) {
        await updateTrustee(token, editing.id, data);
        setAlert('Trustee updated successfully');
      } else {
        await addTrustee(token, data);
        setAlert('Trustee added successfully');
      }
      setEditing(null);
      setShowModal(false);
      load();
    } catch (e) {
      console.error(e);
      setAlert('Failed to save trustee');
    }
  };

  const onRemove = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to remove this trustee?')) return;
    try {
      await removeTrustee(token, id);
      setAlert('Trustee removed successfully');
      load();
    } catch (e) {
      console.error(e);
      setAlert('Failed to remove trustee');
    }
  };

  const onVerify = async (id: string) => {
    if (!token) return;
    try {
      await verifyTrustee(token, id);
      setAlert('Trustee verified successfully');
      load();
    } catch (e) {
      console.error(e);
      setAlert('Failed to verify trustee');
    }
  };

  const onEdit = (t: TrusteeItem) => {
    setEditing(t);
    setShowModal(true);
  };

  const counts = {
    total: trustees.length,
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

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'reviewer':
        return <Eye className="h-4 w-4" />;
      case 'executor':
        return <Gavel className="h-4 w-4" />;
      case 'recipient':
        return <Gift className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const filteredTrustees = trustees.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTier = filterTier === 'all' || t.tier === filterTier;
    return matchSearch && matchTier;
  });

  const toggleSelection = (id: string) => {
    setSelectedTrustees(prev => 
      prev.includes(id) 
        ? prev.filter(tid => tid !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedTrustees(filteredTrustees.map(t => t.id));
  };

  const clearSelection = () => {
    setSelectedTrustees([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {alert && (
        <AnimatedAlert message={alert} type="success" onClose={() => setAlert(null)} />
      )}

      {/* Modern Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center mb-6"
              >
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-white mb-4"
              >
                Estate Trustees
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-blue-100 max-w-2xl mx-auto"
              >
                Manage trusted individuals who will oversee your digital legacy
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          {[
            { icon: UserCheck, label: 'Total Trustees', value: counts.total, color: 'from-blue-500 to-blue-600' },
            { icon: Eye, label: 'Reviewers', value: counts.reviewer, color: 'from-indigo-500 to-indigo-600' },
            { icon: Gavel, label: 'Executors', value: counts.executor, color: 'from-purple-500 to-purple-600' },
            { icon: Gift, label: 'Recipients', value: counts.recipient, color: 'from-green-500 to-green-600' },
            { icon: CheckCircle, label: 'Verified', value: counts.verified, color: 'from-emerald-500 to-emerald-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trustees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Tiers</option>
                <option value="reviewer">Reviewers</option>
                <option value="executor">Executors</option>
                <option value="recipient">Recipients</option>
              </select>

              <div className="flex bg-white/70 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="space-y-1 w-4 h-4">
                    <div className="bg-current h-0.5 rounded-full"></div>
                    <div className="bg-current h-0.5 rounded-full"></div>
                    <div className="bg-current h-0.5 rounded-full"></div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => { setEditing(null); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                Add Trustee
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          <AnimatePresence>
            {selectedTrustees.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedTrustees.length} trustee{selectedTrustees.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        selectedTrustees.forEach(id => onVerify(id));
                        setSelectedTrustees([]);
                      }}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      Verify All
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trustees Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <AnimatePresence>
                {filteredTrustees.map((trustee, index) => (
                  <motion.div
                    key={trustee.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                    
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4">
                      <input
                        type="checkbox"
                        checked={selectedTrustees.includes(trustee.id)}
                        onChange={() => toggleSelection(trustee.id)}
                        className="w-4 h-4 text-blue-600 bg-white/80 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>

                    {/* Verification Badge */}
                    {trustee.verified && (
                      <div className="absolute top-4 right-4">
                        <div className="p-1.5 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    )}

                    <div className="relative z-10">
                      {/* Avatar */}
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
                            {getTierIcon(trustee.tier)}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{trustee.name}</h3>
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-2">
                          <Mail className="h-4 w-4" />
                          <span>{trustee.email}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getTierColor(trustee.tier)}`}>
                          {getTierIcon(trustee.tier)}
                          {trustee.tier}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-center gap-2">
                        {!trustee.verified && (
                          <button
                            onClick={() => onVerify(trustee.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(trustee)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onRemove(trustee.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Trustees List</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAll}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredTrustees.map((trustee, index) => (
                    <motion.div
                      key={trustee.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-6 hover:bg-blue-50/30 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedTrustees.includes(trustee.id)}
                            onChange={() => toggleSelection(trustee.id)}
                            className="w-4 h-4 text-blue-600 bg-white/80 border-gray-300 rounded focus:ring-blue-500"
                          />
                          
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            {trustee.verified && (
                              <div className="absolute -top-1 -right-1 p-0.5 bg-green-100 rounded-full">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{trustee.name}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                              <Mail className="h-4 w-4" />
                              <span>{trustee.email}</span>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getTierColor(trustee.tier)}`}>
                              {getTierIcon(trustee.tier)}
                              {trustee.tier}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!trustee.verified && (
                            <button
                              onClick={() => onVerify(trustee.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => onEdit(trustee)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onRemove(trustee.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>

        {/* Empty State */}
        {filteredTrustees.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center py-16"
          >
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <UserCheck className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trustees found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterTier !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Add your first trustee to get started'
              }
            </p>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Add Your First Trustee
            </button>
          </motion.div>
        )}
      </div>

      <AddTrusteeModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        onSave={saveTrustee}
        initial={editing ?? undefined}
      />
    </div>
  );
}