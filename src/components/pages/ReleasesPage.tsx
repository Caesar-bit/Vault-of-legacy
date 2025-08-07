import { useEffect, useRef, useState, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchReleases,
  addRelease,
  triggerRelease,
  fetchVaultStructure,
  fetchBeneficiaries,
  fetchTrustees,
} from '../../utils/api';
import { AnimatedAlert } from '../AnimatedAlert';
import { VaultItem } from '../FileManager';
import { 
  Clock, 
  CheckCircle, 
  Plus, 
  Calendar, 
  Users, 
  FileText, 
  Send, 
  Filter,
  Search,
  Eye,
  Play,
  Pause,
  MoreVertical,
  AlertTriangle,
  Shield,
  Zap,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReleaseItem {
  id: string;
  filePath: string;
  releaseDate: string;
  triggerEvent: string;
  beneficiaryEmail: string;
  trusteeEmail?: string;
  requiresApproval: boolean;
  released: boolean;
}

interface FlatFile {
  path: string;
  display: string;
}

function flattenFiles(items: VaultItem[], prefix = ''): FlatFile[] {
  let list: FlatFile[] = [];
  for (const item of items) {
    const current = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.type === 'folder') {
      list = list.concat(flattenFiles(item.children || [], current));
    } else if (item.path) {
      list.push({ path: item.path, display: current });
    }
  }
  return list;
}

export function ReleasesPage() {
  const { token, isAuthenticated } = useAuth();
  const [releases, setReleases] = useState<ReleaseItem[]>([]);
  const [filePath, setFilePath] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('date');
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('');
  const [trusteeEmail, setTrusteeEmail] = useState('');
  const [vaultFiles, setVaultFiles] = useState<FlatFile[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<{ id: string; name: string; email: string }[]>([]);
  const [trustees, setTrustees] = useState<{ id: string; name: string; email: string }[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReleases, setSelectedReleases] = useState<string[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchReleases(token!);
      setReleases(data);
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    load();
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/activity', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();
    connection.on('ReleaseTriggered', () => {
      load();
    });
    connection.start();
    connectionRef.current = connection;
    return () => {
      connection.stop();
    };
  }, [isAuthenticated, token, load]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const loadRefs = async () => {
      try {
        const [structure, bens, trs] = await Promise.all([
          fetchVaultStructure(token),
          fetchBeneficiaries(token),
          fetchTrustees(token),
        ]);
        setVaultFiles(flattenFiles(structure));
        setBeneficiaries(bens);
        setTrustees(trs);
      } catch (e) {
        console.error(e);
      }
    };
    loadRefs();
  }, [isAuthenticated, token]);

  const onAdd = async () => {
    if (!token) return;
    if (!filePath || !releaseDate || (!beneficiaryEmail && !trusteeEmail)) {
      setAlert('Please select file, date, and recipient');
      return;
    }
    try {
      await addRelease(token, {
        filePath,
        releaseDate,
        triggerEvent,
        beneficiaryEmail,
        trusteeEmail,
        requiresApproval: false,
      });
      setFilePath('');
      setReleaseDate('');
      setTriggerEvent('date');
      setBeneficiaryEmail('');
      setTrusteeEmail('');
      setShowCreateForm(false);
      setAlert('Release scheduled successfully');
      load();
    } catch (e) {
      console.error(e);
      setAlert('Failed to schedule release');
    }
  };

  const onTrigger = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to trigger this release?')) return;
    try {
      await triggerRelease(token, id);
      setAlert('Release triggered successfully');
      load();
    } catch (e) {
      console.error(e);
      setAlert('Failed to trigger release');
    }
  };

  const stats = {
    total: releases.length,
    pending: releases.filter((r) => !r.released).length,
    completed: releases.filter((r) => r.released).length,
    scheduled: releases.filter((r) => !r.released && new Date(r.releaseDate) > new Date()).length,
  };

  const filtered = releases.filter((r) => {
    const matchesSearch = r.filePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.beneficiaryEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'released' ? r.released : !r.released);
    return matchesSearch && matchesStatus;
  });

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'inactivity':
        return <Clock className="h-4 w-4" />;
      case 'trustee':
        return <Shield className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case 'date':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inactivity':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'trustee':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (releaseDate: string, released: boolean) => {
    return !released && new Date(releaseDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {alert && <AnimatedAlert message={alert} type="success" onClose={() => setAlert(null)} />}

      {/* Modern Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700"></div>
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
                  <Send className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-white mb-4"
              >
                Scheduled Releases
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-emerald-100 max-w-2xl mx-auto"
              >
                Automate the secure transfer of your digital assets to beneficiaries
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
            { icon: Archive, label: 'Total Releases', value: stats.total, color: 'from-emerald-500 to-emerald-600' },
            { icon: Clock, label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-yellow-600' },
            { icon: CheckCircle, label: 'Completed', value: stats.completed, color: 'from-green-500 to-green-600' },
            { icon: Calendar, label: 'Scheduled', value: stats.scheduled, color: 'from-blue-500 to-blue-600' },
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
                  placeholder="Search releases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="all">All Releases</option>
                <option value="pending">Pending</option>
                <option value="released">Completed</option>
              </select>

              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                Schedule Release
              </button>
            </div>
          </div>
        </motion.div>

        {/* Create Release Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Schedule New Release
                  </h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File to Release</label>
                    <select
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={filePath}
                      onChange={(e) => setFilePath(e.target.value)}
                    >
                      <option value="">Select File</option>
                      {vaultFiles.map((f) => (
                        <option key={f.path} value={f.path}>
                          {f.display}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Release Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Event</label>
                    <select
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={triggerEvent}
                      onChange={(e) => setTriggerEvent(e.target.value)}
                    >
                      <option value="date">Specific Date</option>
                      <option value="inactivity">Account Inactivity</option>
                      <option value="trustee">Trustee Approval</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiary</label>
                    <select
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={beneficiaryEmail}
                      onChange={(e) => setBeneficiaryEmail(e.target.value)}
                    >
                      <option value="">Select Beneficiary</option>
                      {beneficiaries.map((b) => (
                        <option key={b.id} value={b.email}>
                          {b.name} ({b.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trustee (Optional)</label>
                    <select
                      className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={trusteeEmail}
                      onChange={(e) => setTrusteeEmail(e.target.value)}
                    >
                      <option value="">Select Trustee</option>
                      {trustees.map((t) => (
                        <option key={t.id} value={t.email}>
                          {t.name} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={onAdd}
                      className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      Schedule Release
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Releases List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Releases</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {filtered.length} release{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {filtered.map((release, index) => (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-6 hover:bg-emerald-50/30 transition-colors group relative ${
                    isOverdue(release.releaseDate, release.released) ? 'bg-red-50/30' : ''
                  }`}
                >
                  {/* Overdue Indicator */}
                  {isOverdue(release.releaseDate, release.released) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-xl shadow-md ${
                        release.released 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                          : isOverdue(release.releaseDate, release.released)
                          ? 'bg-gradient-to-r from-red-500 to-rose-600'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                      }`}>
                        {release.released ? (
                          <CheckCircle className="h-6 w-6 text-white" />
                        ) : isOverdue(release.releaseDate, release.released) ? (
                          <AlertTriangle className="h-6 w-6 text-white" />
                        ) : (
                          <Clock className="h-6 w-6 text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{release.filePath}</h4>
                          {release.released && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Released
                            </span>
                          )}
                          {isOverdue(release.releaseDate, release.released) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium">Release:</span>
                            <span>{new Date(release.releaseDate).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getTriggerColor(release.triggerEvent)}`}>
                              {getTriggerIcon(release.triggerEvent)}
                              {release.triggerEvent}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">To:</span>
                            <span>{release.beneficiaryEmail}</span>
                          </div>
                        </div>

                        {release.trusteeEmail && (
                          <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Trustee:</span>
                            <span>{release.trusteeEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!release.released && (
                        <button
                          onClick={() => onTrigger(release.id)}
                          className="flex items-center gap-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                        >
                          <Zap className="h-4 w-4" />
                          Trigger Now
                        </button>
                      )}
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
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
              <Send className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No releases found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Schedule your first release to get started'
              }
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Schedule Your First Release
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}