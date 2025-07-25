import React, { useState } from 'react';
import { 
  Archive, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Shield, 
  Database,
  HardDrive,
  FileText,
  Image,
  Video,
  Music,
  Folder,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Trash2,
  RefreshCw,
  Settings
} from 'lucide-react';

const mockArchives = [
  {
    id: '1',
    name: 'Family Heritage Collection 2020-2024',
    type: 'collection',
    size: '2.4 GB',
    items: 1247,
    created: '2024-01-15',
    lastBackup: '2024-01-20',
    status: 'active',
    retention: '25 years',
    format: 'ZIP',
    checksum: 'SHA-256'
  },
  {
    id: '2',
    name: 'Historical Documents Archive',
    type: 'documents',
    size: '856 MB',
    items: 342,
    created: '2023-12-10',
    lastBackup: '2024-01-19',
    status: 'archived',
    retention: 'permanent',
    format: 'TAR.GZ',
    checksum: 'SHA-256'
  },
  {
    id: '3',
    name: 'Media Vault Backup Q4 2023',
    type: 'media',
    size: '15.2 GB',
    items: 2156,
    created: '2023-12-31',
    lastBackup: '2024-01-18',
    status: 'verified',
    retention: '50 years',
    format: 'ZIP',
    checksum: 'SHA-256'
  }
];

const retentionPolicies = [
  { name: '1 Year', value: '1y', description: 'Standard retention for temporary content' },
  { name: '5 Years', value: '5y', description: 'Medium-term storage for important documents' },
  { name: '25 Years', value: '25y', description: 'Long-term preservation for family heritage' },
  { name: 'Permanent', value: 'permanent', description: 'Indefinite storage for critical assets' }
];

export function ArchivePage() {
  const [selectedArchives, setSelectedArchives] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'verified': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'collection': return Folder;
      case 'documents': return FileText;
      case 'media': return Image;
      default: return Archive;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Archive Management</h1>
          <p className="mt-2 text-gray-600">Long-term storage, preservation, and backup management</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Verify All
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Archive className="h-4 w-4 mr-2" />
            Create Archive
          </button>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HardDrive className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Storage</p>
              <p className="text-2xl font-bold text-gray-900">18.5 GB</p>
              <p className="text-xs text-gray-500">of 100 GB used</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Archive className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Archives</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-xs text-gray-500">3 created this month</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">98.5%</p>
              <p className="text-xs text-gray-500">integrity check passed</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Retention</p>
              <p className="text-2xl font-bold text-gray-900">25 Years</p>
              <p className="text-xs text-gray-500">preservation period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search archives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="verified">Verified</option>
            </select>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Retention Policies */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Retention Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {retentionPolicies.map((policy) => (
            <div key={policy.value} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <h4 className="font-medium text-gray-900">{policy.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Archives List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Archive Inventory</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {mockArchives.map((archive) => {
            const TypeIcon = getTypeIcon(archive.type);
            return (
              <div key={archive.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedArchives.includes(archive.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedArchives([...selectedArchives, archive.id]);
                        } else {
                          setSelectedArchives(selectedArchives.filter(id => id !== archive.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <TypeIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{archive.name}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{archive.size}</span>
                        <span>{archive.items} items</span>
                        <span>Created {archive.created}</span>
                        <span>Last backup {archive.lastBackup}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(archive.status)}`}>
                          {archive.status}
                        </span>
                        <span className="text-xs text-gray-500">Retention: {archive.retention}</span>
                        <span className="text-xs text-gray-500">Format: {archive.format}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedArchives.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedArchives.length} archive{selectedArchives.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <RefreshCw className="h-4 w-4 mr-1" />
                Verify
              </button>
              <button className="inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}