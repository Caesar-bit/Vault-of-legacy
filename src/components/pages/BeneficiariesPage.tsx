import { useEffect, useState, useMemo } from 'react';
import {
  User,
  CheckCircle,
  Mail,
  Trash2,
  Pencil,
  Phone,
  Heart,
  Search,
  X,
  Plus,
  Users,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchBeneficiaries,
  addBeneficiary,
  removeBeneficiary,
  verifyBeneficiary,
  updateBeneficiary,
} from '../../utils/api';
import { AnimatedAlert } from '../AnimatedAlert';
import { AddBeneficiaryModal } from '../AddBeneficiaryModal';
import { BeneficiaryForm } from '../BeneficiaryForm';
import { AnimatePresence, motion } from 'framer-motion';

interface BeneficiaryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  verified: boolean;
  verifiedAt?: string | null;
}

export function BeneficiariesPage() {
  const { token, isAuthenticated } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BeneficiaryItem | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);
  const [filterRelationship, setFilterRelationship] = useState('all');

  const stats = useMemo(() => {
    const verified = beneficiaries.filter((b) => b.verified).length;
    const total = beneficiaries.length;
    const relationships = [...new Set(beneficiaries.map(b => b.relationship).filter(Boolean))];
    return { total, verified, unverified: total - verified, relationships: relationships.length };
  }, [beneficiaries]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    load();
  }, [isAuthenticated, token]);

  const load = async () => {
    try {
      const data = await fetchBeneficiaries(token!);
      setBeneficiaries(data);
    } catch (e) {
      console.error(e);
    }
  };

  const saveBeneficiary = async (data: {
    name: string;
    email: string;
    phone: string;
    relationship: string;
  }) => {
    if (!token) return;
    try {
      if (editing) {
        await updateBeneficiary(token, editing.id, data);
        setAlert('Beneficiary updated successfully');
      } else {
        await addBeneficiary(token, data);
        setAlert('Beneficiary added successfully');
      }
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
      setAlert('Failed to save beneficiary');
    }
  };

  const handleCreate = async (data: {
    name: string;
    email: string;
    phone: string;
    relationship: string;
  }) => {
    await saveBeneficiary(data);
    setShowForm(false);
  };

  const onRemove = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to remove this beneficiary?')) return;
    try {
      await removeBeneficiary(token, id);
      setAlert('Beneficiary removed successfully');
      load();
    } catch (e) {
      console.error(e);
      setAlert('Failed to remove beneficiary');
    }
  };

  const onVerify = async (id: string) => {
    if (!token) return;
    try {
      await verifyBeneficiary(token, id);
      setAlert('Beneficiary verified successfully');
      load();
    } catch (e) {
      console.error(e);
      setAlert('Failed to verify beneficiary');
    }
  };

  const onEdit = (b: BeneficiaryItem) => {
    setEditing(b);
    setShowModal(true);
  };

  const filtered = beneficiaries.filter(
    (b) => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase());
      const matchesRelationship = filterRelationship === 'all' || b.relationship === filterRelationship;
      return matchesSearch && matchesRelationship;
    }
  );

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'spouse':
        return <Heart className="h-4 w-4" />;
      case 'son':
      case 'daughter':
        return <User className="h-4 w-4" />;
      case 'mother':
      case 'father':
        return <Users className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'spouse':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'son':
      case 'daughter':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mother':
      case 'father':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedBeneficiaries(prev => 
      prev.includes(id) 
        ? prev.filter(bid => bid !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedBeneficiaries(filtered.map(b => b.id));
  };

  const clearSelection = () => {
    setSelectedBeneficiaries([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100">
      {alert && <AnimatedAlert message={alert} type="success" onClose={() => setAlert(null)} />}

      {/* Modern Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-600 to-purple-700"></div>
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
                  <Heart className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-white mb-4"
              >
                Beneficiaries
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-pink-100 max-w-2xl mx-auto"
              >
                Manage the loved ones who will inherit your digital legacy
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { icon: Users, label: 'Total Beneficiaries', value: stats.total, color: 'from-rose-500 to-rose-600' },
            { icon: CheckCircle, label: 'Verified', value: stats.verified, color: 'from-green-500 to-green-600' },
            { icon: Clock, label: 'Pending', value: stats.unverified, color: 'from-yellow-500 to-yellow-600' },
            { icon: Heart, label: 'Relationships', value: stats.relationships, color: 'from-purple-500 to-purple-600' },
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
                  placeholder="Search beneficiaries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filterRelationship}
                onChange={(e) => setFilterRelationship(e.target.value)}
                className="px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              >
                <option value="all">All Relationships</option>
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>

              <div className="flex bg-white/70 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-rose-500 text-white shadow-sm' 
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
                      ? 'bg-rose-500 text-white shadow-sm' 
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
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                Add Beneficiary
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          <AnimatePresence>
            {selectedBeneficiaries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedBeneficiaries.length} beneficiar{selectedBeneficiaries.length > 1 ? 'ies' : 'y'} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        selectedBeneficiaries.forEach(id => onVerify(id));
                        setSelectedBeneficiaries([]);
                      }}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                      Verify All
                    </button>
                    <button
                      onClick={() => setSelectedBeneficiaries([])}
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

        {/* Quick Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Beneficiary</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <BeneficiaryForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Beneficiaries Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <AnimatePresence>
                {filtered.map((beneficiary, index) => (
                  <motion.div
                    key={beneficiary.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                    
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4">
                      <input
                        type="checkbox"
                        checked={selectedBeneficiaries.includes(beneficiary.id)}
                        onChange={() => toggleSelection(beneficiary.id)}
                        className="w-4 h-4 text-rose-600 bg-white/80 border-gray-300 rounded focus:ring-rose-500"
                      />
                    </div>

                    {/* Verification Badge */}
                    {beneficiary.verified && (
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
                          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
                            {getRelationshipIcon(beneficiary.relationship)}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{beneficiary.name}</h3>
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-2">
                          <Mail className="h-4 w-4" />
                          <span>{beneficiary.email}</span>
                        </div>
                        {beneficiary.phone && (
                          <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-2">
                            <Phone className="h-4 w-4" />
                            <span>{beneficiary.phone}</span>
                          </div>
                        )}
                        {beneficiary.relationship && (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getRelationshipColor(beneficiary.relationship)}`}>
                            {getRelationshipIcon(beneficiary.relationship)}
                            {beneficiary.relationship}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-center gap-2">
                        {!beneficiary.verified && (
                          <button
                            onClick={() => onVerify(beneficiary.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(beneficiary)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onRemove(beneficiary.id)}
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
                  <h3 className="text-lg font-semibold text-gray-900">Beneficiaries List</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAll}
                      className="text-sm text-rose-600 hover:text-rose-800 font-medium"
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
                  {filtered.map((beneficiary, index) => (
                    <motion.div
                      key={beneficiary.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-6 hover:bg-rose-50/30 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedBeneficiaries.includes(beneficiary.id)}
                            onChange={() => toggleSelection(beneficiary.id)}
                            className="w-4 h-4 text-rose-600 bg-white/80 border-gray-300 rounded focus:ring-rose-500"
                          />
                          
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            {beneficiary.verified && (
                              <div className="absolute -top-1 -right-1 p-0.5 bg-green-100 rounded-full">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{beneficiary.name}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                              <Mail className="h-4 w-4" />
                              <span>{beneficiary.email}</span>
                            </div>
                            {beneficiary.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                <Phone className="h-4 w-4" />
                                <span>{beneficiary.phone}</span>
                              </div>
                            )}
                            {beneficiary.relationship && (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getRelationshipColor(beneficiary.relationship)}`}>
                                {getRelationshipIcon(beneficiary.relationship)}
                                {beneficiary.relationship}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!beneficiary.verified && (
                            <button
                              onClick={() => onVerify(beneficiary.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => onEdit(beneficiary)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onRemove(beneficiary.id)}
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
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center py-16"
          >
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No beneficiaries found</h3>
            <p className="text-gray-600 mb-6">
              {search || filterRelationship !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Add your first beneficiary to get started'
              }
            </p>
            <button
              onClick={() => { setEditing(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Add Your First Beneficiary
            </button>
          </motion.div>
        )}
      </div>

      <AddBeneficiaryModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        onCreate={saveBeneficiary}
        initial={editing ?? undefined}
      />
    </div>
  );
}