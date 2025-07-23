import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    load();
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

  return (
    <div className="space-y-6">
      {alert && (
        <AnimatedAlert message={alert} type="success" onClose={() => setAlert(null)} />
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Scheduled Releases</h1>
      </div>
      <div className="bg-white shadow rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="File Path"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
          />
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2"
            value={triggerEvent}
            onChange={(e) => setTriggerEvent(e.target.value)}
          >
            <option value="date">Date</option>
            <option value="inactivity">Inactivity</option>
            <option value="trustee">Trustee Approval</option>
          </select>
          <input
            className="border rounded px-3 py-2"
            placeholder="Beneficiary Email"
            value={beneficiaryEmail}
            onChange={(e) => setBeneficiaryEmail(e.target.value)}
          />
          <button
            onClick={onAdd}
            className="bg-primary-600 text-white rounded px-4 py-2"
          >
            Add
          </button>
        </div>
        <table className="min-w-full mt-4">
          <thead>
            <tr className="text-left">
              <th className="py-2">File</th>
              <th className="py-2">Release</th>
              <th className="py-2">Trigger</th>
              <th className="py-2">Beneficiary</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {releases.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">{r.filePath}</td>
                <td className="py-2">{new Date(r.releaseDate).toLocaleDateString()}</td>
                <td className="py-2 capitalize">{r.triggerEvent}</td>
                <td className="py-2">{r.beneficiaryEmail}</td>
                <td className="py-2 text-right">
                  {!r.released && (
                    <button onClick={() => onTrigger(r.id)} className="text-primary-600 hover:underline">
                      Trigger
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
