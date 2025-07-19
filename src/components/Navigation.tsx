// Add Blockchain to navigation links
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  LayoutDashboard, 
  Vault, 
  Clock, 
  FolderOpen, 
  Archive, 
  ImageIcon, 
  Search, 
  Users, 
  BarChart3, 
  Settings, 
  FileText, 
  Download,
  ChevronLeft,
  ChevronRight,
  Globe,
  Key,
  Info
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Navigation({ currentPage, onPageChange, collapsed, onToggleCollapse }: NavigationProps) {
  const { logout, user } = useAuth();
  const { t, currentLanguage, languages, changeLanguage } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const navigation = [
    { name: t('dashboard'), page: 'dashboard', icon: LayoutDashboard },
    { name: t('vault'), page: 'vault', icon: Vault },
    { name: t('timeline'), page: 'timeline', icon: Clock },
    { name: t('collections'), page: 'collections', icon: FolderOpen },
    { name: t('archive'), page: 'archive', icon: Archive },
    { name: t('gallery'), page: 'gallery', icon: ImageIcon },
    { name: t('research'), page: 'research', icon: Search },
    ...(user?.role === 'admin' ? [{ name: t('users'), page: 'users', icon: Users }] : []),
    { name: t('analytics'), page: 'analytics', icon: BarChart3 },
    { name: 'API', page: 'api', icon: Key },
    { name: 'Blockchain', page: 'blockchain', icon: Vault },
    { name: t('settings'), page: 'settings', icon: Settings },
    { name: t('templates'), page: 'templates', icon: FileText },
    { name: t('export'), page: 'export', icon: Download },
    { name: t('about'), page: 'about', icon: Info },
  ];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

  return (
    <div className={`fixed inset-y-0 z-50 flex flex-col lg:flex transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 px-6 pb-4 shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-lg animate-float">
              <Vault className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
            <div className="transition-opacity duration-300">
              <h1 className="text-xl font-bold text-white">Vault</h1>
              <p className="text-sm text-primary-100">Digital Heritage Platform</p>
            </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-white" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-white" />
            )}
          </button>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => onPageChange(item.page)}
                      className={classNames(
                        currentPage === item.page
                          ? 'bg-white/20 text-white border-r-4 border-orange-400 shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10',
                        `group flex gap-x-3 rounded-l-xl p-3 text-sm leading-6 font-medium transition-all duration-300 w-full text-left hover:shadow-lg ${collapsed ? 'justify-center' : ''}`
                      )}
                    >
                      <item.icon
                        className={classNames(
                          currentPage === item.page ? 'text-orange-400' : 'text-white/60 group-hover:text-white',
                          'h-5 w-5 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {!collapsed && (
                        <span className="transition-opacity duration-300">{item.name}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
            <li className="mt-auto">
              {/* Language Selector */}
              <div className="relative mb-4">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className={`group flex gap-x-3 rounded-l-xl p-3 text-sm leading-6 font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 w-full text-left ${collapsed ? 'justify-center' : ''}`}
                >
                  <Globe className="h-5 w-5 shrink-0 text-white/60 group-hover:text-white" />
                  {!collapsed && (
                    <span className="transition-opacity duration-300">{currentLanguage.flag} {currentLanguage.name}</span>
                  )}
                </button>
                {showLanguageDropdown && (
                  <div className={`absolute bottom-full mb-2 ${collapsed ? 'left-16' : 'left-0'} bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48 z-50`}>
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          changeLanguage(language.code);
                          setShowLanguageDropdown(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                className={`group flex gap-x-3 rounded-l-xl p-3 text-sm leading-6 font-medium text-white/80 hover:text-rose-300 hover:bg-rose-500/20 transition-all duration-300 w-full text-left ${collapsed ? 'justify-center' : ''}`}
              >
                <svg className="h-5 w-5 shrink-0 text-white/60 group-hover:text-rose-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                {!collapsed && (
                  <span className="transition-opacity duration-300">{t('signOut')}</span>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}