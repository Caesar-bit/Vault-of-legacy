import { useEffect, useRef } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileDropdownProps {
  user: UserType | null;
  t: (key: string) => string;
  logout: () => void;
  show: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

export function ProfileDropdown({ user, t, logout, show, onClose, onNavigate }: ProfileDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (show) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div ref={ref} className="absolute right-0 mt-2 w-56 bg-white/90 rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 backdrop-blur-xl">
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
        <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {user?.role || 'User'}
          </span>
          {user?.status && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {user.status}
            </span>
          )}
        </div>
        {user?.lastLogin && (
          <p className="text-xs text-gray-500 mt-1">Last login: {new Date(user.lastLogin).toLocaleString()}</p>
        )}
      </div>
      <div className="py-1">
        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50/60 rounded-xl"
          onClick={() => {
            onNavigate?.('profile');
            onClose();
          }}
        >
          <User className="h-4 w-4 mr-3" />
          {t('profile')}
        </button>
        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50/60 rounded-xl"
          onClick={() => {
            onNavigate?.('settings');
            onClose();
          }}
        >
          <Settings className="h-4 w-4 mr-3" />
          {t('settings')}
        </button>
      </div>
      <div className="border-t border-gray-200 py-1">
        <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-xl">
          <LogOut className="h-4 w-4 mr-3" />
          {t('signOut')}
        </button>
      </div>
    </div>
  );
}
