import { useEffect, useState, useRef } from 'react';
import { FolderPlus, Upload } from 'lucide-react';
import { FileManager, VaultItem } from '../FileManager';
import { useAuth } from '../../contexts/AuthContext';
import { fetchVaultStructure, saveVaultStructure, verifyVaultPin } from '../../utils/api';

export function VaultPage({ initialPath = [] }: { initialPath?: string[] }) {
  const { isAuthenticated, token, user } = useAuth();

  const [structure, setStructure] = useState<VaultItem[]>([]);
  const loadedRef = useRef(false);
  const skipSave = useRef(true);
  const skipLog = useRef(false);
  const [requiresPin, setRequiresPin] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    setRequiresPin(!!user?.hasVaultPin);
  }, [user]);

  const handlePinCheck = async () => {
    if (!token) return;
    try {
      await verifyVaultPin(token, pinInput);
      setPinVerified(true);
      setPinError('');
      setPinInput('');
    } catch {
      setPinError('Incorrect PIN');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const data = await fetchVaultStructure(token);
        setStructure(data);
        skipSave.current = true;
        loadedRef.current = true;
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated || !loadedRef.current) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    saveVaultStructure(token, structure, !skipLog.current).catch(console.error);
    skipLog.current = false;
  }, [structure, isAuthenticated, token]);

  useEffect(() => {
    if (!pinVerified) return;
    let timeout: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setPinVerified(false), 5 * 60 * 1000);
    };
    const handleVisibility = () => {
      if (document.hidden) setPinVerified(false);
    };
    reset();
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pinVerified]);

  if (requiresPin && !pinVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md w-80">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Enter Vault PIN</h2>
          <input
            type="password"
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {pinError && <p className="text-sm text-red-600 mb-2">{pinError}</p>}
          <button
            onClick={handlePinCheck}
            className="w-full inline-flex justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-orange-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-purple-500 to-orange-400 shadow-xl rounded-b-3xl mb-6">
        <div className="px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-2 flex items-center gap-3">
              <FolderPlus className="h-8 w-8 text-white animate-float" /> File Manager
            </h1>
            <p className="text-lg text-white/90 font-medium drop-shadow mb-2">Manage, preview, and organize your digital legacy files and folders.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold">Secure Storage</span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold">Fast Search</span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold">Rich Previews</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-300 via-purple-300 to-primary-300 flex items-center justify-center shadow-xl animate-float">
              <Upload className="h-12 w-12 text-white" />
            </div>
            <span className="text-white/80 text-sm mt-2">Drag & drop to upload</span>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none select-none">
          <svg width="200" height="200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="100" fill="url(#paint0_radial)" />
            <defs>
              <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(100 100) scale(100)" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fff" stopOpacity="0.5" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      <FileManager
        initialItems={structure}
        onChange={setStructure}
        onUpload={() => {
          skipLog.current = true;
        }}
        initialPath={initialPath}
      />
    </div>
  );
}
