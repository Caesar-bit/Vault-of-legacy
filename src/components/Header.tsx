import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Bell, Search, Plus, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'New collection shared', message: 'Sarah shared "Wedding Photos" with you', time: '2 min ago', unread: true },
    { id: 2, title: 'Archive completed', message: 'Family Documents archive has been processed', time: '1 hour ago', unread: true },
    { id: 3, title: 'Timeline updated', message: 'New milestone added to "Life Journey"', time: '3 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
          />
        </div>
      </div>
      <div className="flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
        <ThemeToggle />
        <button
          type="button"
          className="flex items-center gap-x-2 rounded-xl bg-gradient-to-r from-primary-500 to-purple-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg hover:from-primary-600 hover:to-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-300 hover:shadow-xl hover:scale-105"
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
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-primary-700">{t('notifications')}</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`px-4 py-3 hover:bg-primary-50/60 cursor-pointer rounded-xl transition-all duration-200 ${notification.unread ? 'bg-blue-50/60' : ''}`}>
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
              </div>
              <div className="px-4 py-2 border-t border-gray-200">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all notifications</button>
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

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white/90 rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 backdrop-blur-xl">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  {user?.role || 'User'}
                </span>
              </div>
              <div className="py-1">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50/60 rounded-xl">
                  <User className="h-4 w-4 mr-3" />
                  {t('profile')}
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50/60 rounded-xl">
                  <Settings className="h-4 w-4 mr-3" />
                  {t('settings')}
                </button>
              </div>
              <div className="border-t border-gray-200 py-1">
                <button 
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  {t('signOut')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
// Add bell animation for notification
// Add this to your global CSS (e.g., index.css or tailwind.css):
// .animate-bell { animation: bell-shake 1s cubic-bezier(.36,.07,.19,.97) both infinite; }
// @keyframes bell-shake { 0%,100%{transform:rotate(0);} 10%,30%,50%,70%,90%{transform:rotate(-10deg);} 20%,40%,60%,80%{transform:rotate(10deg);} }
}