import { useState } from 'react';
import { X, Calendar, FileText, Users, Shield, Zap, AlertTriangle, Clock } from 'lucide-react';

interface FlatFile { path: string; display: string }
interface Person { id: string; name: string; email: string }

interface ScheduleReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultFiles: FlatFile[];
  beneficiaries: Person[];
  trustees: Person[];
  onSchedule: (data: {
    filePath: string;
    releaseDate: string;
    triggerEvent: string;
    beneficiaryEmail: string;
    trusteeEmail?: string;
    inactivityPeriod?: string;
    emergencyReason?: string;
  }) => Promise<void>;
}

export function ScheduleReleaseModal({
  isOpen,
  onClose,
  vaultFiles,
  beneficiaries,
  trustees,
  onSchedule,
}: ScheduleReleaseModalProps) {
  const [filePath, setFilePath] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('date');
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('');
  const [trusteeEmail, setTrusteeEmail] = useState('');
  const [inactivityValue, setInactivityValue] = useState('');
  const [inactivityUnit, setInactivityUnit] = useState('months');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const computeInactivityDate = (value: number, unit: string) => {
    const date = new Date();
    switch (unit) {
      case 'days':
        date.setDate(date.getDate() + value);
        break;
      case 'years':
        date.setFullYear(date.getFullYear() + value);
        break;
      default:
        date.setMonth(date.getMonth() + value);
    }
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!filePath || !beneficiaryEmail) {
      setError('Please select file and beneficiary');
      return;
    }

    let finalDate = releaseDate;
    let inactivityPeriod: string | undefined;
    let reason: string | undefined;

    if (triggerEvent === 'date') {
      if (!releaseDate) {
        setError('Please choose a release date');
        return;
      }
    } else if (triggerEvent === 'inactivity') {
      if (!inactivityValue) {
        setError('Please specify inactivity duration');
        return;
      }
      finalDate = computeInactivityDate(parseInt(inactivityValue, 10), inactivityUnit);
      inactivityPeriod = `${inactivityValue} ${inactivityUnit}`;
    } else if (triggerEvent === 'trustee') {
      if (!trusteeEmail) {
        setError('Trustee approval requires selecting a trustee');
        return;
      }
      finalDate = new Date().toISOString().split('T')[0];
    } else if (triggerEvent === 'emergency') {
      if (!emergencyReason) {
        setError('Please provide an emergency reason');
        return;
      }
      reason = emergencyReason;
      finalDate = new Date().toISOString().split('T')[0];
    }

    await onSchedule({
      filePath,
      releaseDate: finalDate,
      triggerEvent,
      beneficiaryEmail,
      trusteeEmail,
      inactivityPeriod,
      emergencyReason: reason,
    });

    setFilePath('');
    setReleaseDate('');
    setTriggerEvent('date');
    setBeneficiaryEmail('');
    setTrusteeEmail('');
    setInactivityValue('');
    setInactivityUnit('months');
    setEmergencyReason('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-2xl space-y-6 animate-slide-up border border-white/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Schedule Release</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" /> File to Release
            </span>
            <select
              className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
            >
              <option value="">Select File</option>
              {vaultFiles.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.display}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4" /> Trigger Event
            </span>
            <select
              className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
            >
              <option value="date">Specific Date</option>
              <option value="inactivity">Account Inactivity</option>
              <option value="trustee">Trustee Approval</option>
              <option value="emergency">Emergency Release</option>
            </select>
          </label>

          {triggerEvent === 'date' && (
            <label className="block">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" /> Release Date
              </span>
              <input
                type="date"
                className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </label>
          )}

          {triggerEvent === 'inactivity' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" /> Inactivity Period
                </span>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={inactivityValue}
                  onChange={(e) => setInactivityValue(e.target.value)}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2 invisible">unit</span>
                <select
                  className="px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={inactivityUnit}
                  onChange={(e) => setInactivityUnit(e.target.value)}
                >
                  <option value="days">Days</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          )}

          {triggerEvent === 'emergency' && (
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" /> Emergency Reason
              </span>
              <textarea
                className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" /> Beneficiary
            </span>
            <select
              className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={beneficiaryEmail}
              onChange={(e) => setBeneficiaryEmail(e.target.value)}
            >
              <option value="">Select Beneficiary</option>
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.email}>
                  {b.name} ({b.email})
                </option>
              ))}
            </select>
          </label>

          {(triggerEvent === 'trustee' || triggerEvent === 'date') && (
            <label className="block">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" /> Trustee {triggerEvent === 'trustee' ? '(Required)' : '(Optional)'}
              </span>
              <select
                className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={trusteeEmail}
                onChange={(e) => setTrusteeEmail(e.target.value)}
              >
                <option value="">Select Trustee</option>
                {trustees.map((t) => (
                  <option key={t.id} value={t.email}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </label>
          )}
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
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            onClick={handleSubmit}
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

