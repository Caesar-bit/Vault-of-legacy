import React, { useState } from 'react';
import { APIKeyModal } from './APIKeyModal';
import { fetchApiKeys, createApiKey, deleteApiKey, regenerateApiKey } from '../../utils/apikeys';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  RefreshCw, 
  Shield, 
  Book,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Activity,
  BarChart3
} from 'lucide-react';

const mockApiKeys = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'vl_prod_1234567890abcdef',
    permissions: ['read', 'write', 'delete'],
    lastUsed: '2024-01-20T10:30:00Z',
    created: '2024-01-01',
    status: 'active',
    requests: 15420
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'vl_dev_abcdef1234567890',
    permissions: ['read', 'write'],
    lastUsed: '2024-01-19T15:45:00Z',
    created: '2024-01-10',
    status: 'active',
    requests: 3240
  },
  {
    id: '3',
    name: 'Analytics Integration',
    key: 'vl_analytics_fedcba0987654321',
    permissions: ['read'],
    lastUsed: '2024-01-18T09:20:00Z',
    created: '2024-01-15',
    status: 'inactive',
    requests: 890
  }
];

const apiEndpoints = [
  { method: 'GET', endpoint: '/api/v1/assets', description: 'Retrieve all assets' },
  { method: 'POST', endpoint: '/api/v1/assets', description: 'Create new asset' },
  { method: 'GET', endpoint: '/api/v1/collections', description: 'List collections' },
  { method: 'POST', endpoint: '/api/v1/collections', description: 'Create collection' },
  { method: 'GET', endpoint: '/api/v1/timeline', description: 'Get timeline events' },
  { method: 'POST', endpoint: '/api/v1/timeline', description: 'Add timeline event' },
  { method: 'GET', endpoint: '/api/v1/users', description: 'List users (admin only)' },
  { method: 'GET', endpoint: '/api/v1/analytics', description: 'Get analytics data' }
];

export function APIPage() {
  useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => 
      prev.includes(keyId) 
        ? prev.filter(id => id !== keyId)
        : [...prev, keyId]
    );
  };

  // Fetch API keys on mount
  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('vault_jwt');
        if (!token) throw new Error('Not authenticated');
        const keys = await fetchApiKeys(token);
        setApiKeys(keys);
      } catch (e: any) {
        setError(e.message || 'Failed to load API keys');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreateKey = async (name: string, permissions: string[]) => {
    try {
      const token = localStorage.getItem('vault_jwt');
      if (!token) throw new Error('Not authenticated');
      const newKey = await createApiKey(token, name, permissions);
      setApiKeys(prev => [newKey, ...prev]);
      setToast('API key created!');
    } catch (e: any) {
      setToast(e.message || 'Failed to create API key');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast('Copied to clipboard!');
  };

  const handleRefresh = async (id: string) => {
    try {
      const token = localStorage.getItem('vault_jwt');
      if (!token) throw new Error('Not authenticated');
      const updated = await regenerateApiKey(token, id);
      setApiKeys(prev => prev.map(k => k.id === id ? updated : k));
      setToast('API key regenerated!');
    } catch (e: any) {
      setToast(e.message || 'Failed to regenerate API key');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to revoke this API key?')) {
      try {
        const token = localStorage.getItem('vault_jwt');
        if (!token) throw new Error('Not authenticated');
        await deleteApiKey(token, id);
        setApiKeys(prev => prev.filter(k => k.id !== id));
        setToast('API key revoked!');
      } catch (e: any) {
        setToast(e.message || 'Failed to revoke API key');
      }
    }
  };

  const handleOpenDocs = () => {
    window.open('https://your-api-docs-url.com', '_blank');
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'revoked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <APIKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateKey}
      />
      {toast && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Management</h1>
          <p className="mt-2 text-gray-600">Manage API keys and access to your Vault of Legacy data</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={handleOpenDocs}
          >
            <Book className="h-4 w-4 mr-2" />
            API Documentation
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </button>
        </div>
      </div>

      {/* API Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Keys</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockApiKeys.filter(k => k.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockApiKeys.reduce((sum, key) => sum + key.requests, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rate Limit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1000/hr</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Security Level</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">High</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h3>
        </div>
        {loading ? (
          <div className="p-6 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : (
        <div className="divide-y divide-gray-200">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{apiKey.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(apiKey.status)}`}>
                      {apiKey.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {visibleKeys.includes(apiKey.id) ? apiKey.key : '••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {visibleKeys.includes(apiKey.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(apiKey.key)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Created {new Date(apiKey.created).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-1" />
                        {apiKey.requests?.toLocaleString?.() ?? 0} requests
                      </div>
                      <div>
                        Last used: {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
                      </div>
                    </div>

                  <div className="flex space-x-1 mt-2">
                    {apiKey.permissions.map((permission: string) => (
                      <span key={permission} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    onClick={() => handleRefresh(apiKey.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    onClick={() => handleDelete(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* API Endpoints Documentation */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Endpoints</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {apiEndpoints.map((endpoint, index) => (
            <div key={index} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-gray-900 dark:text-white">{endpoint.endpoint}</code>
                </div>
                <p className="text-sm text-gray-600">{endpoint.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Limiting & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rate Limiting</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Requests per hour</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">1,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Requests per day</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">10,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Concurrent requests</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">50</span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <CheckCircle className="h-4 w-4" />
                <span>Rate limiting active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Features</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-900 dark:text-white">HTTPS/TLS encryption</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-900 dark:text-white">API key authentication</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-900 dark:text-white">Request signing</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-900 dark:text-white">IP whitelisting</span>
            </div>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-gray-900 dark:text-white">Audit logging</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}