import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { UploadMediaModal } from './UploadMediaModal';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  Upload,
  Eye,
  Archive,
  ImageIcon,
  Video,
  Music,
  FolderOpen,
  Lock,
  MessageSquare,
  Calendar as CalendarIcon
} from 'lucide-react';
import { ActivityLog } from '../types';
import { getRecentActivity } from '../utils/api';

const stats = [
  { name: 'Total Assets', value: '12,847', change: '+12%', changeType: 'increase', icon: FileText },
  { name: 'Active Projects', value: '23', change: '+3', changeType: 'increase', icon: FolderOpen },
  { name: 'Monthly Views', value: '45,672', change: '+18%', changeType: 'increase', icon: Eye },
  { name: 'Contributors', value: '156', change: '+7', changeType: 'increase', icon: Users },
];


const quickActions = [
  { name: 'Upload Media', icon: Upload, color: 'bg-blue-500' },
  { name: 'Create Timeline', icon: Clock, color: 'bg-green-500' },
  { name: 'New Collection', icon: FolderOpen, color: 'bg-purple-500' },
  { name: 'Archive Content', icon: Archive, color: 'bg-orange-500' },
];

const assetBreakdown = [
  { type: 'Images', count: 7842, icon: ImageIcon, color: 'text-blue-600' },
  { type: 'Documents', count: 3205, icon: FileText, color: 'text-green-600' },
  { type: 'Videos', count: 1456, icon: Video, color: 'text-purple-600' },
  { type: 'Audio', count: 344, icon: Music, color: 'text-orange-600' },
];

function getActivityIcon(action: string) {
  if (action.includes('Uploaded')) return Upload;
  if (action.includes('password')) return Lock;
  if (action.includes('profile')) return Users;
  if (action.includes('chat')) return MessageSquare;
  return FileText;
}

import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [recent, setRecent] = useState<ActivityLog[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    getRecentActivity(token).then(setRecent).catch(console.error);
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/activity', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();
    connection.on('NewActivity', (activity: ActivityLog) => {
      setRecent((prev) => [activity, ...prev].slice(0, 20));
    });
    connection.start();
    connectionRef.current = connection;
    return () => { connection.stop(); };
  }, [token]);

  const handleQuickAction = (actionName: string) => {
    switch (actionName) {
      case 'Upload Media':
        setShowUploadModal(true);
        break;
      case 'Create Timeline':
        navigate('/timeline');
        break;
      case 'New Collection':
        navigate('/collections');
        break;
      case 'Archive Content':
        navigate('/archive');
        break;
      default:
        break;
    }
  };

  return (
    <>
    <div className="space-y-8">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-purple-500 to-orange-400 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl mb-4">
        <div className="px-4 py-8 sm:px-6 md:px-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full md:w-2/3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white dark:text-primary-100 drop-shadow-lg mb-2 flex items-center gap-3">
              <span role="img" aria-label="vault" className="text-4xl sm:text-5xl">🗄️</span> {t('dashboard')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 dark:text-primary-200 font-medium drop-shadow mb-2">
              {t('welcome')}, <span className="font-bold">{user?.name || 'User'}</span>! Here's an overview of your digital legacy platform.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-white/20 dark:bg-gray-700/40 text-white dark:text-primary-200 px-3 py-1 rounded-full text-xs font-semibold">Digital Heritage</span>
              <span className="bg-white/20 dark:bg-gray-700/40 text-white dark:text-primary-200 px-3 py-1 rounded-full text-xs font-semibold">Secure Storage</span>
              <span className="bg-white/20 dark:bg-gray-700/40 text-white dark:text-primary-200 px-3 py-1 rounded-full text-xs font-semibold">Collaboration</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 w-full md:w-auto mt-6 md:mt-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-300 via-purple-300 to-primary-300 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center shadow-xl animate-float">
              <span className="text-4xl sm:text-6xl">🌐</span>
            </div>
            <span className="text-white/80 dark:text-primary-200 text-xs sm:text-sm mt-2">Empowering your legacy</span>
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

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const gradients = [
            'from-primary-500 to-primary-600',
            'from-emerald-500 to-emerald-600', 
            'from-purple-500 to-purple-600',
            'from-orange-500 to-orange-600'
          ];
          return (
            <div key={stat.name} className="bg-white dark:bg-gray-900 overflow-hidden shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradients[index]} shadow-lg`}>
                      <stat.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">{t(stat.name.toLowerCase().replace(' ', '')) || stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-3xl font-bold text-gray-900 dark:text-primary-100">{stat.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'increase' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          <TrendingUp className="h-4 w-4 flex-shrink-0 self-center" />
                          <span className="ml-1">{stat.change}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions, Asset Breakdown, and Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800 lg:col-span-1">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">{t('quickActions')}</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {quickActions.map((action, index) => {
                const gradients = [
                  'from-primary-500 to-primary-600',
                  'from-emerald-500 to-emerald-600',
                  'from-purple-500 to-purple-600',
                  'from-orange-500 to-orange-600'
                ];
                return (
                <button
                  key={action.name}
                  onClick={() => handleQuickAction(action.name)}
                  className="flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-gradient-to-br hover:from-primary-50 hover:to-purple-50 transition-all duration-300 group hover:shadow-lg"
                >
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <action.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 text-center">{t(action.name.toLowerCase().replace(' ', '')) || action.name}</span>
                </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Asset Breakdown with Progress Bars */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 lg:col-span-1">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-primary-100 mb-4 sm:mb-6">Asset Breakdown</h3>
            <div className="space-y-3 sm:space-y-4">
              {assetBreakdown.map((asset, index) => {
                const colors = ['text-primary-600', 'text-emerald-600', 'text-purple-600', 'text-orange-600'];
                const bgColors = ['bg-primary-50', 'bg-emerald-50', 'bg-purple-50', 'bg-orange-50'];
                // Calculate percentage for progress bar
                const total = assetBreakdown.reduce((sum, a) => sum + a.count, 0);
                const percent = Math.round((asset.count / total) * 100);
                return (
                <div key={asset.type} className={`p-4 rounded-xl ${bgColors[index]} dark:bg-gray-800 hover:shadow-md transition-all duration-200`}> 
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <asset.icon className={`h-6 w-6 ${colors[index]} dark:text-primary-400 mr-3`} />
                      <span className="font-semibold text-gray-900 dark:text-primary-100">{asset.type}</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-primary-100">{asset.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${colors[index]} dark:bg-primary-700 bg-gradient-to-r from-white/60 dark:from-gray-700`} style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">{percent}% of assets</div>
                </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-4 sm:p-6 lg:col-span-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-primary-100 mb-4 sm:mb-6 flex items-center gap-2"><CalendarIcon className="h-6 w-6 text-primary-500 dark:text-primary-400" /> Calendar</h3>
          <div className="w-full flex justify-center">
            <div className="rounded-xl overflow-hidden shadow border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-2 sm:p-4">
              <CalendarMini />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-primary-100 mb-4 sm:mb-6">Recent Activity</h3>
          <div className="flow-root">
            <ul className="-my-4 sm:-my-5 divide-y divide-gray-200 dark:divide-gray-800">
              {recent.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.action);
                return (
                  <li key={activity.id} className="py-4 sm:py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center shadow-md">
                          <ActivityIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base text-gray-900">
                          <span className="font-semibold text-primary-600">{activity.action}</span> {activity.item}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="flex-shrink-0 flex items-center justify-end">
                        <button className="text-xs sm:text-sm text-primary-600 hover:text-primary-800 font-semibold px-2 sm:px-3 py-1 rounded-lg hover:bg-primary-50 transition-all duration-200">
                          View
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
    {showUploadModal && (
      <UploadMediaModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={(file) => console.log('Uploaded', file.name)}
      />
    )}
    </>
  );
// Simple calendar mini component for visual effect
function CalendarMini() {
  // Get current date
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  const day = today.getDate();
  // Get first day of month
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  // Get number of days in month
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return (
    <div className="w-64">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-primary-600 dark:text-primary-300">{month} {year}</span>
        <span className="text-xs text-gray-400 dark:text-gray-300">Today: {day}</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {['S','M','T','W','T','F','S'].map((d) => (
          <div key={d} className="text-center font-semibold text-gray-500 dark:text-gray-300">{d}</div>
        ))}
        {days.map((d, i) => (
          d ? (
            <div key={i} className={`text-center rounded-full w-7 h-7 flex items-center justify-center ${d === day ? 'bg-primary-500 dark:bg-primary-400 text-white font-bold shadow' : 'text-gray-700 dark:text-gray-200'}`}>{d}</div>
          ) : (
            <div key={i} />
          )
        ))}
      </div>
    </div>
  );
}
}