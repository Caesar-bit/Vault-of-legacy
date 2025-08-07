import { useState, useEffect } from 'react';
import { User, Mail, Phone, Heart } from 'lucide-react';

export interface BeneficiaryFormValues {
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

interface BeneficiaryFormProps {
  initial?: BeneficiaryFormValues;
  onSubmit: (data: BeneficiaryFormValues) => void;
  onCancel?: () => void;
}

export function BeneficiaryForm({ initial, onSubmit, onCancel }: BeneficiaryFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
    });
    setName('');
    setEmail('');
    setPhone('');
    setRelationship('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
          <Phone className="h-4 w-4" /> Phone
        </span>
        <input
          className="mt-1 w-full rounded-lg border-gray-300 focus:ring-primary-500"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <Heart className="h-4 w-4" /> Relationship
        </span>
        <select
          className="mt-1 w-full rounded-lg border-gray-300 focus:ring-primary-500"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
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
      {error && <div className="text-red-500 text-sm pt-1">{error}</div>}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
        >
          {initial ? 'Save' : 'Add'}
        </button>
      </div>
    </form>
  );
}

