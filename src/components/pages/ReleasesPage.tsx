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
import { Clock, CheckCircle } from 'lucide-react';

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
      setAlert('Please select item, date, and recipient or trustee');
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
      setAlert('Release scheduled');
      load();
    } catch (e) {
      console.error(e);
      setAlert('Failed to schedule');
    }
  };

  const onTrigger = async (id: string) => {
    if (!token) return;
    try {
      await triggerRelease(token, id);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const stats = {
    pending: releases.filter((r) => !r.released).length,
    completed: releases.filter((r) => r.released).length,
  };

  const filtered = releases.filter((r) =>
    filterStatus === 'all' ? true : filterStatus === 'released' ? r.released : !r.released
  );

  return (
    <div className="space-y-8">
      {alert && <AnimatedAlert message={alert} type="success" onClose={() => setAlert(null)} />}

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-10 pb-8 rounded-3xl bg-white/60 backdrop-blur-lg shadow-xl border border-white/30 overflow-hidden" style={{ background: 'linear-gradient(120deg,rgba(74,222,128,0.15),rgba(59,130,246,0.15) 100%)' }}>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Releases</h1>
          <p className="mt-2 text-lg text-gray-700">Schedule and monitor secure file hand-offs</p>
        </div>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-green-400/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            label: 'Pending',
            value: stats.pending,
            color: 'from-yellow-100 to-yellow-50',
            icon: <Clock className="h-7 w-7 text-yellow-600" />,
          },
          {
            label: 'Completed',
            value: stats.completed,
            color: 'from-green-100 to-green-50',
            icon: <CheckCircle className="h-7 w-7 text-green-600" />,
          },
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

      <div className="glassy-card p-6 rounded-3xl border border-white/30 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Schedule Release</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <select
            className="border rounded px-3 py-2 bg-white/80"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
          >
            <option value="">Select Item</option>
            {vaultFiles.map((f) => (
              <option key={f.path} value={f.path}>
                {f.display}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="border rounded px-3 py-2 bg-white/80"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2 bg-white/80"
            value={triggerEvent}
            onChange={(e) => setTriggerEvent(e.target.value)}
          >
            <option value="date">Date</option>
            <option value="inactivity">Inactivity</option>
            <option value="trustee">Trustee Approval</option>
          </select>
          <select
            className="border rounded px-3 py-2 bg-white/80"
            value={beneficiaryEmail}
            onChange={(e) => setBeneficiaryEmail(e.target.value)}
          >
            <option value="">Beneficiary</option>
            {beneficiaries.map((b) => (
              <option key={b.id} value={b.email}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            className="border rounded px-3 py-2 bg-white/80"
            value={trusteeEmail}
            onChange={(e) => setTrusteeEmail(e.target.value)}
          >
            <option value="">Trustee</option>
            {trustees.map((t) => (
              <option key={t.id} value={t.email}>
                {t.name}
              </option>
            ))}
          </select>
          <button onClick={onAdd} className="bg-primary-600 text-white rounded px-4 py-2">
            Add
          </button>
        </div>
      </div>

      <div className="bg-white/70 p-6 rounded-3xl border border-white/30 shadow-xl backdrop-blur-lg flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white/80 shadow">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="released">Released</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((r) => (
          <div key={r.id} className="glassy-card rounded-2xl border border-white/30 p-5 shadow-lg backdrop-blur-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{r.filePath}</p>
              <p className="text-sm text-gray-600">Release: {new Date(r.releaseDate).toLocaleDateString()} | {r.triggerEvent}</p>
              <p className="text-sm text-gray-600">Beneficiary: {r.beneficiaryEmail || '—'}</p>
              {r.trusteeEmail && (
                <p className="text-sm text-gray-600">Trustee: {r.trusteeEmail}</p>
              )}
            </div>
            {!r.released && (
              <button onClick={() => onTrigger(r.id)} className="text-primary-600 hover:underline">Trigger</button>
            )}
          </div>
        ))}
      </div>

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
