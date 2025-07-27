import { useState, useEffect } from 'react';
import { User, Mail, Gavel } from 'lucide-react';

interface AddTrusteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; email: string; tier: string }) => void;
  initial?: { name: string; email: string; tier: string } | null;
}

export function AddTrusteeModal({ isOpen, onClose, onSave, initial }: AddTrusteeModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [tier, setTier] = useState(initial?.tier ?? 'reviewer');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initial?.name ?? '');
    setEmail(initial?.email ?? '');
    setTier(initial?.tier ?? 'reviewer');
  }, [initial]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    onSave({ name: name.trim(), email: email.trim(), tier });
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4 animate-slide-up">
        <h2 className="text-xl font-bold mb-2">{initial ? 'Edit Trustee' : 'Add Trustee'}</h2>
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <User className="h-4 w-4" /> Name
            </span>
            <input
              className="mt-1 w-full rounded-lg border-gray-300 focus:ring-primary-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Mail className="h-4 w-4" /> Email
            </span>
            <input
              className="mt-1 w-full rounded-lg border-gray-300 focus:ring-primary-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Gavel className="h-4 w-4" /> Tier
            </span>
            <select
              className="mt-1 w-full rounded-lg border-gray-300 focus:ring-primary-500"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
            >
              <option value="reviewer">Reviewer</option>
              <option value="executor">Executor</option>
              <option value="recipient">Recipient</option>
            </select>
          </label>
        </div>
        {error && <div className="text-red-500 text-sm pt-1">{error}</div>}
        <div className="flex justify-end gap-2 pt-4">
          <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
            onClick={handleSubmit}
          >
            {initial ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
