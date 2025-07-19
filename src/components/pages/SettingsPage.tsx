import React, { useEffect, useRef, useState } from 'react';
import { 
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Globe,
  Key,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertTriangle
} from 'lucide-react';


const settingsSections = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'appearance', name: 'Appearance', icon: Palette },
  { id: 'data', name: 'Data & Storage', icon: Database },
  { id: 'privacy', name: 'Privacy', icon: Globe },
  { id: 'api', name: 'API Keys', icon: Key },
  { id: 'backup', name: 'Backup & Export', icon: Download }
];

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState(() => {
    const stored = localStorage.getItem('vault_api_keys');
    return stored ? JSON.parse(stored) : [];
  });
  const defaultSettings = {
    profile: { name: "", email: "", bio: "", avatar: "" },
    security: { twoFactorEnabled: false, passwordLastChanged: "", sessionTimeout: 30, loginNotifications: false },
    notifications: { emailNotifications: false, pushNotifications: false, weeklyDigest: false, securityAlerts: false, collaborationUpdates: false },
    appearance: { theme: "light", language: "en", timezone: "UTC", dateFormat: "MM/DD/YYYY" },
    data: { storageUsed: 0, storageLimit: 100, autoBackup: false, compressionEnabled: false, retentionPeriod: 0 },
    privacy: { profileVisibility: "private", searchEngineIndexing: false, analyticsTracking: false, dataSharing: false }
  };
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('vault_settings');
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordInputs, setPasswordInputs] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const saveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('vault_settings', JSON.stringify(settings));
      localStorage.setItem('vault_api_keys', JSON.stringify(apiKeys));
      setIsSaving(false);
      setToast('Settings saved');
    }, 800);
  };

  const downloadFile = (data: string, name: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBackup = () => {
    downloadFile(JSON.stringify(settings, null, 2), 'vault-backup.json', 'application/json');
    setToast('Backup downloaded');
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (format === 'json') {
      downloadFile(JSON.stringify(settings, null, 2), 'vault-export.json', 'application/json');
    } else {
      const csv = Object.entries(settings.profile)
        .map(([k, v]) => `${k},${String(v)}`)
        .join('\n');
      downloadFile(csv, 'vault-export.csv', 'text/csv');
    }
    setToast(`Exported ${format.toUpperCase()}`);
    setTimeout(() => setToast(null), 3000);
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setToast('Key copied');
  };

  const revokeKey = (id: string) => {
    setApiKeys(prev => {
      const updated = prev.filter(k => k.id !== id);
      localStorage.setItem('vault_api_keys', JSON.stringify(updated));
      return updated;
    });
    setToast('Key revoked');
  };

  const generateKey = () => {
    const newKey = `sk-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
    setApiKeys(prev => {
      const updated = [...prev, { id: Date.now().toString(), key: newKey }];
      localStorage.setItem('vault_api_keys', JSON.stringify(updated));
      return updated;
    });
    setToast('Key generated');
  };

  const handlePhotoClick = () => fileInputRef.current?.click();
  const onPhotoChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        setSettings(prev => ({
          ...prev,
          profile: { ...prev.profile, avatar: reader.result as string },
        }));
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordUpdate = () => {
    if (!passwordInputs.new || passwordInputs.new !== passwordInputs.confirm) {
      setToast('Passwords do not match');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          passwordLastChanged: new Date().toISOString().slice(0, 10),
        },
      }));
      setPasswordInputs({ current: '', new: '', confirm: '' });
      setIsSaving(false);
      setToast('Password updated');
    }, 800);
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={settings.profile.avatar}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <button
                onClick={handlePhotoClick}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </button>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
              <input ref={fileInputRef} onChange={onPhotoChange} type="file" accept="image/*" className="hidden" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, name: e.target.value }
                }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, email: e.target.value }
                }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              rows={3}
              value={settings.profile.bio}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, bio: e.target.value }
              }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.security.twoFactorEnabled && (
                <Check className="h-5 w-5 text-green-600" />
              )}
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, twoFactorEnabled: !prev.security.twoFactorEnabled }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.security.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
            <p className="text-sm text-gray-600 mb-4">Last changed: {settings.security.passwordLastChanged}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInputs.current}
                    onChange={e => setPasswordInputs(p => ({ ...p, current: e.target.value }))}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordInputs.new}
                    onChange={e => setPasswordInputs(p => ({ ...p, new: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordInputs.confirm}
                    onChange={e => setPasswordInputs(p => ({ ...p, confirm: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handlePasswordUpdate}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Session Management</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
            { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Get a weekly summary of activity' },
            { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security notifications' },
            { key: 'collaborationUpdates', label: 'Collaboration Updates', description: 'Updates from team members' }
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{notification.label}</h4>
                <p className="text-sm text-gray-600">{notification.description}</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  notifications: { 
                    ...prev.notifications, 
                    [notification.key]: !prev.notifications[notification.key as keyof typeof prev.notifications]
                  }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications[notification.key as keyof typeof settings.notifications] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications[notification.key as keyof typeof settings.notifications] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Storage</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Storage Usage</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {settings.data.storageUsed} GB</span>
                <span>Limit: {settings.data.storageLimit} GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(settings.data.storageUsed / settings.data.storageLimit) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Auto Backup</h4>
              <p className="text-sm text-gray-600">Automatically backup your data daily</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                data: { ...prev.data, autoBackup: !prev.data.autoBackup }
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.data.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.data.autoBackup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Data Retention</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retention Period (years)</label>
              <select
                value={settings.data.retentionPeriod}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  data: { ...prev.data, retentionPeriod: parseInt(e.target.value) }
                }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 year</option>
                <option value={5}>5 years</option>
                <option value={25}>25 years</option>
                <option value={50}>50 years</option>
                <option value={999}>Permanent</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Appearance Section
  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Theme</h4>
            <select
              value={settings.appearance.theme}
              onChange={e => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, theme: e.target.value } }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Language</h4>
            <select
              value={settings.appearance.language}
              onChange={e => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, language: e.target.value } }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Timezone</h4>
            <input
              type="text"
              value={settings.appearance.timezone}
              onChange={e => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, timezone: e.target.value } }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Privacy Section
  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Profile Visibility</h4>
            <select
              value={settings.privacy.profileVisibility}
              onChange={e => setSettings(prev => ({ ...prev, privacy: { ...prev.privacy, profileVisibility: e.target.value } }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Search Engine Indexing</h4>
              <p className="text-sm text-gray-600">Allow search engines to index your profile</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, privacy: { ...prev.privacy, searchEngineIndexing: !prev.privacy.searchEngineIndexing } }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.privacy.searchEngineIndexing ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.privacy.searchEngineIndexing ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Analytics Tracking</h4>
              <p className="text-sm text-gray-600">Allow analytics tracking for product improvement</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, privacy: { ...prev.privacy, analyticsTracking: !prev.privacy.analyticsTracking } }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.privacy.analyticsTracking ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.privacy.analyticsTracking ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Data Sharing</h4>
              <p className="text-sm text-gray-600">Allow sharing of anonymized data for research</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, privacy: { ...prev.privacy, dataSharing: !prev.privacy.dataSharing } }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.privacy.dataSharing ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // API Keys Section
  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Your API Keys</h4>
            <p className="text-sm text-gray-600 mb-2">Manage your API keys for integrations and automation.</p>
            {apiKeys.map(key => (
              <div key={key.id} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={key.key}
                  readOnly
                  className="w-64 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                />
                <button
                  onClick={() => copyKey(key.key)}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  Copy
                </button>
                <button
                  onClick={() => revokeKey(key.id)}
                  className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200"
                >
                  Revoke
                </button>
              </div>
            ))}
            <button
              onClick={generateKey}
              className="mt-4 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              Generate New Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Backup & Export Section
  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & Export</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Backup Data</h4>
            <p className="text-sm text-gray-600 mb-2">Download a backup of your data for safekeeping.</p>
            <button
              onClick={handleBackup}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 inline-flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />Download Backup
            </button>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
            <p className="text-sm text-gray-600 mb-2">Export your data in CSV or JSON format.</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSettings();
      case 'security': return renderSecuritySettings();
      case 'notifications': return renderNotificationSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'data': return renderDataSettings();
      case 'privacy': return renderPrivacySettings();
      case 'api': return renderApiSettings();
      case 'backup': return renderBackupSettings();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
      {/* Glassy Animated Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-10 pb-8 mb-6 rounded-3xl bg-white/60 backdrop-blur-lg shadow-xl border border-white/30 overflow-hidden" style={{background: 'linear-gradient(120deg,rgba(59,130,246,0.10),rgba(236,72,153,0.10) 100%)'}}>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm tracking-tight">Settings</h1>
          <p className="mt-2 text-lg text-gray-700">Manage your account preferences and configuration</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="mt-6 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-pink-500 shadow-lg hover:scale-105 hover:shadow-xl transition disabled:opacity-60"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        {/* Animated background blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl animate-pulse z-0" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl animate-pulse z-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="glassy-card rounded-2xl border border-white/30 shadow-xl backdrop-blur-lg p-4">
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-100 to-pink-100 text-blue-700 border-r-4 border-blue-600 scale-105 shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${activeSection === section.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium">{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="glassy-card rounded-2xl border border-white/30 shadow-xl backdrop-blur-lg p-6 space-y-6">
            {renderCurrentSection()}
          </div>
        </div>
      </div>

      {/* Custom styles for glassy/animated cards */}
      <style>{`
        .glassy-card {
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
}