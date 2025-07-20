import { useEffect, useState, useRef } from 'react';
import { FolderPlus, Upload } from 'lucide-react';
import { FileManager, VaultItem } from '../FileManager';
import { useAuth } from '../../contexts/AuthContext';
import { fetchVaultStructure, saveVaultStructure } from '../../utils/api';

export function VaultPage({ initialPath = [] }: { initialPath?: string[] }) {
  const { isAuthenticated, token } = useAuth();

  const [structure, setStructure] = useState<VaultItem[]>([]);
  const loadedRef = useRef(false);
  const skipSave = useRef(true);

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
    saveVaultStructure(token, structure).catch(console.error);
  }, [structure, isAuthenticated, token]);

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

      <FileManager initialItems={structure} onChange={setStructure} initialPath={initialPath} />
    </div>
  );
}
