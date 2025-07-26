import { useState, useEffect } from 'react';

interface AddBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; email: string; phone: string; relationship: string }) => void;
  initial?: { name: string; email: string; phone: string; relationship: string } | null;
}

export function AddBeneficiaryModal({ isOpen, onClose, onCreate, initial }: AddBeneficiaryModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [relationship, setRelationship] = useState(initial?.relationship ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initial?.name ?? '');
    setEmail(initial?.email ?? '');
    setPhone(initial?.phone ?? '');
    setRelationship(initial?.relationship ?? '');
  }, [initial]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    onCreate({ name: name.trim(), email: email.trim(), phone: phone.trim(), relationship: relationship.trim() });
    setName('');
    setEmail('');
    setPhone('');
    setRelationship('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold mb-2">{initial ? 'Edit Beneficiary' : 'Add Beneficiary'}</h2>
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Name</span>
            <input
              className="mt-1 w-full rounded-lg border-gray-300 focus:ring-primary-500"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              className="mt-1 w-full rounded-lg border-gray-300 focus:ring-primary-500"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Phone</span>
            <input
              className="mt-1 w-full rounded-lg border-gray-300 focus:ring-primary-500"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Relationship</span>
            <select
              className="mt-1 w-full rounded-lg border-gray-300 focus:ring-primary-500"
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
            >
              <option value="">Select relationship</option>
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Spouse">Spouse</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
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
