import { useState } from 'react';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, permissions: string[]) => void;
}

const PERMISSIONS = ['read', 'write', 'delete'];

export function APIKeyModal({ isOpen, onClose, onCreate }: APIKeyModalProps) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggle = (perm: string) => {
    setSelected((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = () => {
    if (!name.trim() || selected.length === 0) {
      setError('Name and at least one permission are required.');
      return;
    }
    onCreate(name.trim(), selected);
    setName('');
    setSelected([]);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create API Key</h2>
        <input
          type="text"
          placeholder="Key Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
        />
        <div className="mb-4">
          <div className="font-semibold mb-2">Permissions:</div>
          <div className="flex gap-3">
            {PERMISSIONS.map((perm) => (
              <label key={perm} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selected.includes(perm)}
                  onChange={() => handleToggle(perm)}
                />
                {perm}
              </label>
            ))}
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
