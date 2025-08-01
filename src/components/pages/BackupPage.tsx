import React, { useState } from 'react';
import { 
  HardDrive, 
  Cloud, 
  Download, 
  Upload, 
  RefreshCw, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  Shield,
  Database,
  Archive,
  Zap,
  Globe,
  Server,
  Save
} from 'lucide-react';

const mockBackups = [
  {
    id: '1',
    name: 'Full System Backup',
    type: 'full',
    size: '2.4 GB',
    created: '2024-01-20T10:30:00Z',
    status: 'completed',
    location: 'cloud',
    retention: '1 year',
    encrypted: true
  },
  {
    id: '2',
    name: 'Incremental Backup',
    type: 'incremental',
    size: '156 MB',
    created: '2024-01-19T15:45:00Z',
    status: 'completed',
    location: 'local',
    retention: '30 days',
    encrypted: true
  },
  {
    id: '3',
    name: 'Media Files Backup',
    type: 'selective',
    size: '1.8 GB',
    created: '2024-01-18T09:20:00Z',
    status: 'in_progress',
    location: 'cloud',
    retention: '6 months',
    encrypted: true
  }
];

const backupSchedules = [
  { name: 'Daily Incremental', frequency: 'daily', time: '02:00', enabled: true },
  { name: 'Weekly Full', frequency: 'weekly', time: 'Sunday 03:00', enabled: true },
  { name: 'Monthly Archive', frequency: 'monthly', time: '1st 04:00', enabled: false }
];

export function BackupPage() {
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    cloudSync: true,
    encryption: true,
    compression: true,
    retentionDays: 365,
    maxBackups: 10
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return Database;
      case 'incremental': return RefreshCw;
      case 'selective': return Archive;
      default: return HardDrive;
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'cloud': return Cloud;
      case 'local': return HardDrive;
      case 'remote': return Server;
      default: return HardDrive;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backup & Recovery</h1>
          <p className="mt-2 text-gray-600">Manage backups, schedules, and data recovery options</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Now
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Create Backup
          </button>
        </div>
      </div>

      {/* Backup Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HardDrive className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Backups</p>
              <p className="text-2xl font-bold text-gray-900">{mockBackups.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockBackups.filter(b => b.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Cloud className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cloud Storage</p>
              <p className="text-2xl font-bold text-gray-900">4.2 GB</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Backup</p>
              <p className="text-2xl font-bold text-gray-900">2h ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Schedules */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Schedules</h3>
        <div className="space-y-4">
          {backupSchedules.map((schedule, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{schedule.name}</h4>
                  <p className="text-sm text-gray-600">
                    {schedule.frequency} at {schedule.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  schedule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {schedule.enabled ? 'Active' : 'Inactive'}
                </span>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    schedule.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      schedule.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Backup History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {mockBackups.map((backup) => {
            const TypeIcon = getTypeIcon(backup.type);
            const LocationIcon = getLocationIcon(backup.location);
            return (
              <div key={backup.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <TypeIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{backup.name}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{backup.size}</span>
                        <span>{new Date(backup.created).toLocaleDateString()}</span>
                        <span>Retention: {backup.retention}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(backup.status)}`}>
                          {backup.status.replace('_', ' ')}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <LocationIcon className="h-3 w-3" />
                          <span>{backup.location}</span>
                        </div>
                        {backup.encrypted && (
                          <div className="flex items-center space-x-1 text-xs text-green-600">
                            <Shield className="h-3 w-3" />
                            <span>Encrypted</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Settings</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Automatic Backups</h4>
                <p className="text-sm text-gray-600">Enable scheduled automatic backups</p>
              </div>
              <button
                onClick={() => setBackupSettings(prev => ({ ...prev, autoBackup: !prev.autoBackup }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  backupSettings.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    backupSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Cloud Synchronization</h4>
                <p className="text-sm text-gray-600">Sync backups to cloud storage</p>
              </div>
              <button
                onClick={() => setBackupSettings(prev => ({ ...prev, cloudSync: !prev.cloudSync }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  backupSettings.cloudSync ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    backupSettings.cloudSync ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Encryption</h4>
                <p className="text-sm text-gray-600">Encrypt backup files</p>
              </div>
              <button
                onClick={() => setBackupSettings(prev => ({ ...prev, encryption: !prev.encryption }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  backupSettings.encryption ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    backupSettings.encryption ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
              <select
                value={backupSettings.retentionDays}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
                <option value={1825}>5 years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Backups</label>
              <select
                value={backupSettings.maxBackups}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, maxBackups: parseInt(e.target.value) }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 backups</option>
                <option value={10}>10 backups</option>
                <option value={20}>20 backups</option>
                <option value={50}>50 backups</option>
              </select>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Quick Recovery</h4>
                  <p className="text-sm text-blue-700">Restore from any backup point in under 5 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}