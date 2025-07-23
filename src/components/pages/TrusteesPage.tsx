import { useEffect, useState } from 'react';
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

  return (
    <div className="space-y-6">
      {alert && (
        <AnimatedAlert message={alert} type="success" onClose={() => setAlert(null)} />
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trustees</h1>
      </div>
      <div className="bg-white shadow rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2"
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
        <table className="min-w-full">
          <thead>
            <tr className="text-left">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Tier</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {trustees.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="py-2">{t.name}</td>
                <td className="py-2">{t.email}</td>
                <td className="py-2 capitalize">{t.tier}</td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => onRemove(t.id)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
