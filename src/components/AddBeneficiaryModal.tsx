import { BeneficiaryForm, BeneficiaryFormValues } from './BeneficiaryForm';
import { X, Heart } from 'lucide-react';

interface AddBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: BeneficiaryFormValues) => void;
  initial?: BeneficiaryFormValues | null;
}

export function AddBeneficiaryModal({ isOpen, onClose, onCreate, initial }: AddBeneficiaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6 animate-slide-up border border-white/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Heart className="h-5 w-5 text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{initial ? 'Edit Beneficiary' : 'Add Beneficiary'}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <BeneficiaryForm
          initial={initial ?? undefined}
          onSubmit={(data) => {
            onCreate(data);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
