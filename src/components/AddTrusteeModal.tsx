import { useState, useEffect } from 'react';
import { User, Mail, Gavel, X, Shield } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6 animate-slide-up border border-white/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{initial ? 'Edit Trustee' : 'Add Trustee'}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <User className="h-4 w-4" /> Name
            </span>
            <input
              className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter trustee's full name"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4" /> Email
            </span>
            <input
              className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Gavel className="h-4 w-4" /> Tier
            </span>
            <select
              className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
            >
              <option value="reviewer">Reviewer - Can review and approve releases</option>
              <option value="executor">Executor - Can execute estate instructions</option>
              <option value="recipient">Recipient - Will receive specific assets</option>
            </select>
          </label>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-2">
          <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            onClick={handleSubmit}
          >
            {initial ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
