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
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
          <User className="h-4 w-4" /> Name
        </span>
        <input
          className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter beneficiary's full name"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
          <Mail className="h-4 w-4" /> Email
        </span>
        <input
          className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
          <Phone className="h-4 w-4" /> Phone
        </span>
        <input
          className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number (optional)"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
          <Heart className="h-4 w-4" /> Relationship
        </span>
        <select
          className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200"
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
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          {initial ? 'Save Changes' : 'Add Beneficiary'}
        </button>
      </div>
    </form>
  );
}