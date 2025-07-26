import { useEffect, useState } from 'react';
import { User, CheckCircle, Mail, PlusCircle, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchBeneficiaries,
  addBeneficiary,
  removeBeneficiary,
  verifyBeneficiary,
  updateBeneficiary,
} from '../../utils/api';
import { AnimatedAlert } from '../AnimatedAlert';
import { AddBeneficiaryModal } from '../AddBeneficiaryModal';

interface BeneficiaryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  verified: boolean;
}

export function BeneficiariesPage() {
  const { token, isAuthenticated } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BeneficiaryItem | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    load();
  }, [isAuthenticated, token]);

  const load = async () => {
    try {
      const data = await fetchBeneficiaries(token!);
      setBeneficiaries(data);
    } catch (e) {
      console.error(e);
    }
  };

  const saveBeneficiary = async (data: {
    name: string;
    email: string;
    phone: string;
    relationship: string;
  }) => {
    if (!token) return;
    try {
      if (editing) {
        await updateBeneficiary(token, editing.id, data);
        setAlert('Beneficiary updated');
      } else {
        await addBeneficiary(token, data);
        setAlert('Beneficiary added');
      }
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
      setAlert('Failed to save');
    }
  };

  const onRemove = async (id: string) => {
    if (!token) return;
    try {
      await removeBeneficiary(token, id);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const onVerify = async (id: string) => {
    if (!token) return;
    try {
      await verifyBeneficiary(token, id);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const onEdit = (b: BeneficiaryItem) => {
    setEditing(b);
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      {alert && <AnimatedAlert message={alert} type="success" onClose={() => setAlert(null)} />}
      <div className="relative px-6 pt-10 pb-8 rounded-3xl bg-white/60 backdrop-blur-lg shadow-xl border border-white/30 overflow-hidden">
        <h1 className="text-4xl font-extrabold text-gray-900">Beneficiaries</h1>
        <p className="text-lg text-gray-700 mt-2">Manage who will receive your files</p>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-green-400/20 rounded-full blur-2xl animate-pulse" />
      </div>
      <div className="glassy-card p-6 rounded-3xl border border-white/30 shadow-xl flex justify-between items-center">
        <h3 className="text-lg font-bold">Beneficiaries</h3>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
          <PlusCircle className="h-5 w-5" /> Add
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {beneficiaries.map((b) => (
          <div key={b.id} className="glassy-card rounded-2xl border border-white/30 p-5 shadow-lg backdrop-blur-lg relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-green-400/10 rounded-full blur-xl" />
            <div className="flex items-center space-x-3 mb-2 relative z-10">
              <div className="p-2 bg-white/60 rounded-xl shadow">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{b.name}</h3>
            </div>
            <div className="space-y-1 text-sm text-gray-600 mb-3 relative z-10">
              <div className="flex items-center"><Mail className="h-4 w-4 mr-1" />{b.email}</div>
              {b.phone && <div className="flex items-center"><span className="w-4 inline-block" /><span>{b.phone}</span></div>}
              {b.relationship && <div className="flex items-center"><span className="w-4 inline-block" /><span className="italic">{b.relationship}</span></div>}
            </div>
            <div className="flex items-center justify-between relative z-10">
              {b.verified ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <button onClick={() => onVerify(b.id)} className="text-primary-600 hover:underline text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" /> Verify
                </button>
              )}
              <div className="flex gap-2">
                <button onClick={() => onEdit(b)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => onRemove(b.id)} className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .glassy-card {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
        }
      `}</style>
      <AddBeneficiaryModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        onCreate={saveBeneficiary}
        initial={editing ?? undefined}
      />
    </div>
  );
}
