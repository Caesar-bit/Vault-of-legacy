import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe, 
  Users, 
  FileText, 
  Settings,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Key,
  Database,
  UserCheck
} from 'lucide-react';

export function PrivacyPage() {
  const [settings, setSettings] = useState({
    profileVisibility: 'private',
    searchEngineIndexing: false,
    dataSharing: false,
    analyticsTracking: true,
    cookieConsent: true,
    emailMarketing: false,
    thirdPartyIntegrations: false,
    dataRetention: '25years',
    encryptionLevel: 'aes256',
    twoFactorAuth: true,
    loginNotifications: true,
    accessLogging: true
  });

  const [showDataExport, setShowDataExport] = useState(false);
  const [showDataDeletion, setShowDataDeletion] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Privacy & Data Protection</h1>
          <p className="mt-2 text-gray-600">Manage your privacy settings and data protection preferences</p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>

      {/* Privacy Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Data Encrypted</h4>
              <p className="text-sm text-green-700">AES-256 encryption active</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <Lock className="h-8 w-8 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Access Controlled</h4>
              <p className="text-sm text-blue-700">Role-based permissions</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
            <UserCheck className="h-8 w-8 text-purple-600" />
            <div>
              <h4 className="font-medium text-purple-900">GDPR Compliant</h4>
              <p className="text-sm text-purple-700">Full data rights support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Privacy */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Privacy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public - Visible to everyone</option>
              <option value="friends">Friends Only - Visible to connections</option>
              <option value="private">Private - Only visible to you</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Search Engine Indexing</h4>
              <p className="text-sm text-gray-600">Allow search engines to index your public content</p>
            </div>
            <button
              onClick={() => handleSettingChange('searchEngineIndexing', !settings.searchEngineIndexing)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.searchEngineIndexing ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.searchEngineIndexing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Sharing & Analytics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sharing & Analytics</h3>
        <div className="space-y-4">
          {[
            { key: 'dataSharing', label: 'Data Sharing with Partners', description: 'Share anonymized data with trusted partners for research' },
            { key: 'analyticsTracking', label: 'Analytics Tracking', description: 'Help us improve the platform with usage analytics' },
            { key: 'emailMarketing', label: 'Email Marketing', description: 'Receive promotional emails and product updates' },
            { key: 'thirdPartyIntegrations', label: 'Third-party Integrations', description: 'Allow connections with external services' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{setting.label}</h4>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <button
                onClick={() => handleSettingChange(setting.key, !settings[setting.key as keyof typeof settings])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[setting.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[setting.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention Period</label>
            <select
              value={settings.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1year">1 Year</option>
              <option value="5years">5 Years</option>
              <option value="25years">25 Years</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Encryption Level</label>
            <select
              value={settings.encryptionLevel}
              onChange={(e) => handleSettingChange('encryptionLevel', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="aes128">AES-128 (Standard)</option>
              <option value="aes256">AES-256 (High Security)</option>
              <option value="aes256gcm">AES-256-GCM (Maximum Security)</option>
            </select>
          </div>

          {[
            { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Require 2FA for account access' },
            { key: 'loginNotifications', label: 'Login Notifications', description: 'Get notified of new login attempts' },
            { key: 'accessLogging', label: 'Access Logging', description: 'Log all account access attempts' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{setting.label}</h4>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <button
                onClick={() => handleSettingChange(setting.key, !settings[setting.key as keyof typeof settings])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[setting.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[setting.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Rights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Data Rights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowDataExport(true)}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Database className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Export Your Data</h4>
                <p className="text-sm text-gray-600">Download all your data</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <button
            onClick={() => setShowDataDeletion(true)}
            className="flex items-center justify-between p-4 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Delete Account</h4>
                <p className="text-sm text-gray-600">Permanently delete your account</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Cookie Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cookie Preferences</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Essential Cookies</h4>
                <p className="text-sm text-blue-700">Required for basic site functionality. Cannot be disabled.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
              <p className="text-sm text-gray-600">Help us understand how you use our site</p>
            </div>
            <button
              onClick={() => handleSettingChange('cookieConsent', !settings.cookieConsent)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.cookieConsent ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.cookieConsent ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}