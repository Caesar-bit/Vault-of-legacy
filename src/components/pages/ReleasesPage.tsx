import { useEffect, useRef, useState } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useAuth } from '../../contexts/AuthContext';
import { fetchReleases, addRelease, triggerRelease } from '../../utils/api';
import { AnimatedAlert } from '../AnimatedAlert';

interface ReleaseItem {
  id: string;
  filePath: string;
  releaseDate: string;
  triggerEvent: string;
  beneficiaryEmail: string;
  requiresApproval: boolean;
  released: boolean;
}

export function ReleasesPage() {
  const { token, isAuthenticated } = useAuth();
  const [releases, setReleases] = useState<ReleaseItem[]>([]);
  const [filePath, setFilePath] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('date');
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('');
  const [alert, setAlert] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const connectionRef = useRef<HubConnection | null>(null);

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
  }, [isAuthenticated, token]);

  const load = async () => {
    try {
      const data = await fetchReleases(token!);
      setReleases(data);
    } catch (e) {
      console.error(e);
    }
  };

  const onAdd = async () => {
    if (!token) return;
    try {
      await addRelease(token, { filePath, releaseDate, triggerEvent, beneficiaryEmail, requiresApproval: false });
      setFilePath('');
      setReleaseDate('');
      setTriggerEvent('date');
      setBeneficiaryEmail('');
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
          { label: 'Pending', value: stats.pending, color: 'from-yellow-100 to-yellow-50' },
          { label: 'Completed', value: stats.completed, color: 'from-green-100 to-green-50' },
        ].map((stat, i) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl border border-white/40 shadow flex items-center space-x-4 glassy-card animate-fade-in`} style={{ animationDelay: `${i * 80}ms` }}>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glassy-card p-6 rounded-3xl border border-white/30 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Schedule Release</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="border rounded px-3 py-2 bg-white/80" placeholder="File Path" value={filePath} onChange={(e) => setFilePath(e.target.value)} />
          <input type="date" className="border rounded px-3 py-2 bg-white/80" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
          <select className="border rounded px-3 py-2 bg-white/80" value={triggerEvent} onChange={(e) => setTriggerEvent(e.target.value)}>
            <option value="date">Date</option>
            <option value="inactivity">Inactivity</option>
            <option value="trustee">Trustee Approval</option>
          </select>
          <input className="border rounded px-3 py-2 bg-white/80" placeholder="Beneficiary" value={beneficiaryEmail} onChange={(e) => setBeneficiaryEmail(e.target.value)} />
          <button onClick={onAdd} className="bg-primary-600 text-white rounded px-4 py-2">Add</button>
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
              <p className="text-sm text-gray-600">Beneficiary: {r.beneficiaryEmail}</p>
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
