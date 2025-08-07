import { BeneficiaryForm, BeneficiaryFormValues } from './BeneficiaryForm';

interface AddBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: BeneficiaryFormValues) => void;
  initial?: BeneficiaryFormValues | null;
}

export function AddBeneficiaryModal({ isOpen, onClose, onCreate, initial }: AddBeneficiaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4 animate-slide-up">
        <h2 className="text-xl font-bold mb-2">{initial ? 'Edit Beneficiary' : 'Add Beneficiary'}</h2>
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
