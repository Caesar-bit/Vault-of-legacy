import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Bell, Search, Plus, Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { NewProjectModal } from './NewProjectModal';
import { ProfileDropdown } from './ProfileDropdown';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem('vault_notifications');
    if (stored) return JSON.parse(stored);
    return [
      { id: 1, title: 'New collection shared', message: 'Sarah shared "Wedding Photos" with you', time: '2 min ago', unread: true },
      { id: 2, title: 'Archive completed', message: 'Family Documents archive has been processed', time: '1 hour ago', unread: true },
      { id: 3, title: 'Timeline updated', message: 'New milestone added to "Life Journey"', time: '3 hours ago', unread: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem('vault_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const searchItems = [
    { name: t('dashboard'), page: 'dashboard' },
    { name: t('vault'), page: 'vault' },
    { name: t('timeline'), page: 'timeline' },
    { name: t('collections'), page: 'collections' },
    { name: t('archive'), page: 'archive' },
    { name: t('gallery'), page: 'gallery' },
    { name: t('research'), page: 'research' },
    ...(user?.role === 'admin' ? [{ name: t('users'), page: 'users' }] : []),
    { name: t('analytics'), page: 'analytics' },
    { name: t('settings'), page: 'settings' },
    { name: t('templates'), page: 'templates' },
    { name: t('export'), page: 'export' },
    { name: 'API', page: 'api' },
    { name: 'Blockchain', page: 'blockchain' },
    { name: t('about'), page: 'about' },
  ];

  const filteredSuggestions = searchItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (page: string) => {
    setSearchTerm('');
    setShowSuggestions(false);
    navigate(`/${page}`);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, unread: false } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleCreateProject = (project: { name: string; description: string }) => {
    const stored = localStorage.getItem('vault_projects');
    const projects = stored ? JSON.parse(stored) : [];
    projects.push({ id: Date.now(), ...project });
    localStorage.setItem('vault_projects', JSON.stringify(projects));
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-primary-200 bg-white/60 bg-gradient-to-r from-white/80 to-primary-50/80 px-2 sm:px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8 backdrop-blur-xl">
      {/* Mobile menu button */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 text-primary-500 hover:text-primary-700 hover:bg-primary-100/60 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-primary-400" aria-hidden="true" />
          </div>
          <input
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-primary-400 focus:ring-2 focus:ring-primary-500 rounded-lg sm:text-sm bg-white/70 backdrop-blur-md shadow-inner"
            placeholder={t('searchPlaceholder')}
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {showSuggestions && searchTerm && (
            <ul className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl bg-white shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map(item => (
                  <li key={item.page}>
                    <button
                      onMouseDown={() => handleSelect(item.page)}
                      className="block w-full text-left px-4 py-2 hover:bg-primary-50"
                    >
                      {item.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-sm text-gray-500">No results</li>
              )}
            </ul>
          )}
        </div>
      </div>
      <div className="flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
        <ThemeToggle />
        <button
          type="button"
          className="flex items-center gap-x-2 rounded-xl bg-gradient-to-r from-primary-500 to-purple-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg hover:from-primary-600 hover:to-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-300 hover:shadow-xl hover:scale-105"
          onClick={() => setShowNewProject(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">{t('newProject')}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative -m-2.5 p-2.5 text-primary-400 hover:text-primary-600 transition-colors duration-200 animate-bell"
            style={{ animationPlayState: unreadCount > 0 ? 'running' : 'paused' }}
          >
            <span className="sr-only">{t('notifications')}</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white/90 rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 backdrop-blur-xl">
              <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-primary-700">{t('notifications')}</h3>
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary-500 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`px-4 py-3 hover:bg-primary-50/60 cursor-pointer rounded-xl transition-all duration-200 ${notification.unread ? 'bg-blue-50/60' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="px-4 py-3 text-sm text-gray-500">No notifications</p>
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-200 flex justify-between">
                <button onClick={clearNotifications} className="text-sm text-red-600 hover:text-red-800 font-medium">Clear</button>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="-m-1.5 flex items-center p-1.5 hover:bg-primary-100/60 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <span className="sr-only">Open user menu</span>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg border-2 border-white/60">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <span className="hidden lg:flex lg:items-center">
              <span className="ml-4 text-sm font-semibold leading-6 text-gray-800" aria-hidden="true">
                {user?.name || 'User'}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
            </span>
          </button>
          <ProfileDropdown
            user={user}
            t={t}
            logout={logout}
            show={showProfileDropdown}
            onClose={() => setShowProfileDropdown(false)}
          />
        </div>
      </div>
      <NewProjectModal
        isOpen={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
