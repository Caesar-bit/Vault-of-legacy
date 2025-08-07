import React, { useEffect, useMemo, useState } from 'react';
import { AnimatedAlert } from '../AnimatedAlert';
import { VaultItem } from '../FileManager';
import { useAuth } from '../../contexts/AuthContext';
import { fetchVaultStructure } from '../../utils/api';
import { useUserData } from '../../utils/userData';
import { 
  Download, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Trash2,
  Share2,
  Search,
  HardDrive,
  Cloud,
  Database
} from 'lucide-react';

const parseSize = (size: string) => {
  const [value, unit] = size.split(' ');
  const num = parseFloat(value);
  switch (unit?.toLowerCase()) {
    case 'gb':
      return num * 1024 * 1024 * 1024;
    case 'mb':
      return num * 1024 * 1024;
    case 'kb':
      return num * 1024;
    default:
      return num;
  }
};

const formatSize = (bytes: number) => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

const generateRandomSize = () => {
  const bytes =
    Math.floor(Math.random() * (5 * 1024 ** 3 - 100 * 1024 ** 2)) +
    100 * 1024 ** 2;
  return formatSize(bytes);
};

const exportFormats = [
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'Portable document format for universal viewing',
    icon: FileText,
    size: 'Small',
    quality: 'High',
    compatibility: 'Universal'
  },
  {
    id: 'zip',
    name: 'ZIP Archive',
    description: 'Compressed archive containing all files',
    icon: Archive,
    size: 'Medium',
    quality: 'Original',
    compatibility: 'Universal'
  },
  {
    id: 'html',
    name: 'HTML Website',
    description: 'Interactive web format with navigation',
    icon: Settings,
    size: 'Large',
    quality: 'High',
    compatibility: 'Web Browsers'
  },
  {
    id: 'json',
    name: 'JSON Data',
    description: 'Structured data format for developers',
    icon: Database,
    size: 'Small',
    quality: 'Original',
    compatibility: 'Developers'
  }
];


const contentTypes = [
  { id: 'photos', name: 'Photos', icon: Image, count: 1247 },
  { id: 'videos', name: 'Videos', icon: Video, count: 89 },
  { id: 'documents', name: 'Documents', icon: FileText, count: 456 },
  { id: 'audio', name: 'Audio', icon: Music, count: 34 },
  { id: 'timeline', name: 'Timeline', icon: Clock, count: 1 },
  { id: 'collections', name: 'Collections', icon: Archive, count: 12 },
  { id: 'research', name: 'Research', icon: Settings, count: 23 }
];

export function ExportPage() {
  const [selectedFormat, setSelectedFormat] = useState('zip');
  const [selectedContent, setSelectedContent] = useState<string[]>(['photos', 'documents']);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [format, setFormat] = useState('zip');
  const [source, setSource] = useState<'vault' | 'gallery'>('vault');
  const { isAuthenticated, token } = useAuth();
  const [vaultStructure, setVaultStructure] = useState<VaultItem[]>([]);
  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const data = await fetchVaultStructure(token);
        setVaultStructure(data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [isAuthenticated, token]);
  const [vaultPath, setVaultPath] = useState<string[]>([]);
  const [vaultSelected, setVaultSelected] = useState<string[]>([]);
  interface GalleryItem {
    id: string;
    title: string;
  }
  const [galleryItems] = useUserData<GalleryItem[]>('gallery_items', []);
  const [gallerySelected, setGallerySelected] = useState<string[]>([]);
  interface ExportItem {
    id: string;
    name: string;
    format: string;
    status: string;
    created: string;
    size: string;
    downloadCount: number;
    includes: string[];
    source?: 'vault' | 'gallery';
    path?: string[];
    items: string[];
    itemNames?: string[];
    expires?: string;
  }
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [detailsExport, setDetailsExport] = useState<ExportItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [exportsList, setExportsList] = useUserData<ExportItem[]>('exports', []);

  const folderOptions = useMemo(() => {
    const paths: Array<{ label: string; path: string[] }> = [];
    const traverse = (items: VaultItem[], base: string[], labelParts: string[]) => {
      paths.push({ label: labelParts.join('/') || 'Root', path: base });
      for (const item of items) {
        if (item.type === 'folder') {
          traverse(item.children || [], [...base, item.id], [...labelParts, item.name]);
        }
      }
    };
    traverse(vaultStructure, [], []);
    return paths;
  }, [vaultStructure]);

  const getItemsAtPath = (items: VaultItem[], p: string[]): VaultItem[] => {
    let current = items;
    for (const id of p) {
      const folder = current.find((i) => i.id === id && i.type === 'folder');
      if (!folder) return [];
      current = folder.children || [];
    }
    return current;
  };

  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 3000);
    return () => clearTimeout(t);
  }, [alert]);


  const simulateProcessing = (id: string) => {
    setTimeout(() => {
      setExportsList((prev) =>
        prev.map((ex) =>
          ex.id === id
            ? {
                ...ex,
                status: 'completed',
                size: ex.size === '0 MB' ? generateRandomSize() : ex.size,
              }
            : ex
        )
      );
      setAlert({ message: 'Export completed', type: 'success' });
    }, 3000);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Format', 'Size', 'Status', 'Created'];
    const rows = exportsList.map((e) =>
      [e.name, e.format, e.size, e.status, e.created].join(',')
    );
    const blob = new Blob([
      [headers.join(','), ...rows].join('\n')
    ], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exports.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareExport = async (item: ExportItem) => {
    const url = `${window.location.origin}?export=${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.name, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setAlert({ message: 'Link copied to clipboard', type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setAlert({ message: 'Unable to share', type: 'error' });
    }
  };

  const deleteExport = (id: string) => {
    setExportsList((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
    setAlert({ message: 'Export deleted', type: 'success' });
  };

  const refreshStatuses = () => {
    exportsList.forEach((e) => {
      if (e.status === 'processing') simulateProcessing(e.id);
    });
    setAlert({ message: 'Refreshing exports', type: 'success' });
  };

  const totalSize = formatSize(
    exportsList.reduce((sum, e) => sum + parseSize(e.size), 0)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return RefreshCw;
      case 'failed': return AlertTriangle;
      default: return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleContentType = (contentId: string) => {
    setSelectedContent(prev =>
      prev.includes(contentId)
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  return (
    <>
    <div className="space-y-6">
      {alert && (
        <AnimatedAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Export & Migration</h1>
          <p className="mt-2 text-gray-600">Export your data in various formats for backup or migration</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Create Export
          </button>
          <button
            onClick={refreshStatuses}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Exports</p>
              <p className="text-2xl font-bold text-gray-900">{exportsList.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {exportsList.filter(e => e.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HardDrive className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">{totalSize}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Cloud className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Downloads</p>
              <p className="text-2xl font-bold text-gray-900">
                {exportsList.reduce((sum, e) => sum + e.downloadCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Formats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exportFormats.map((format) => {
            const Icon = format.icon;
            return (
              <div
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  selectedFormat === format.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${selectedFormat === format.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icon className={`h-5 w-5 ${selectedFormat === format.id ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <h4 className="font-medium text-gray-900">{format.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">{format.description}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{format.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality:</span>
                    <span>{format.quality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compatibility:</span>
                    <span>{format.compatibility}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Content to Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contentTypes.map((content) => {
            const Icon = content.icon;
            const isSelected = selectedContent.includes(content.id);
            return (
              <div
                key={content.id}
                onClick={() => toggleContentType(content.id)}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span className="font-medium text-gray-900">{content.name}</span>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{content.count} items</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">Export History</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {exportsList
            .filter((e) =>
              (filterStatus === 'all' || e.status === filterStatus) &&
              e.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((exportItem) => {
            const StatusIcon = getStatusIcon(exportItem.status);
            return (
              <div key={exportItem.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Download className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{exportItem.name}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{exportItem.format}</span>
                        <span>{exportItem.size}</span>
                        <span>Created {formatDate(exportItem.created)}</span>
                        {exportItem.expires && (
                          <span>Expires {formatDate(exportItem.expires)}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1">
                          <StatusIcon className={`h-4 w-4 ${exportItem.status === 'processing' ? 'animate-spin' : ''}`} />
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(exportItem.status)}`}>
                            {exportItem.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {exportItem.downloadCount} download{exportItem.downloadCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exportItem.includes.map((include) => (
                          <span key={include} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {include}
                          </span>
                        ))}
                        {exportItem.itemNames && exportItem.itemNames.map((n) => (
                          <span key={n} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {n}
                          </span>
                        ))}
                      </div>
                      {exportItem.source && (
                        <div className="text-xs text-gray-500 mt-1">
                          Source: {exportItem.source}
                          {exportItem.path && (
                            <> &nbsp;| Path: {exportItem.path.length ? exportItem.path.join(' / ') : 'Root'}</>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {exportItem.status === 'completed' && (
                    <button
                      onClick={() => {
                        setExportsList((prev) =>
                          prev.map((ex) =>
                            ex.id === exportItem.id
                              ? { ...ex, downloadCount: (ex.downloadCount || 0) + 1 }
                              : ex
                          )
                        );
                        setAlert({ message: 'Download started', type: 'success' });
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    )}
                    <button
                      onClick={() => setDetailsExport(exportItem)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => shareExport(exportItem)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(exportItem.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {showCreateModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Export</h3>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const itemNames =
                source === 'vault'
                  ? vaultSelected.map(id => {
                      const file = getItemsAtPath(vaultStructure, vaultPath).find(f => f.id === id);
                      return file?.name || id;
                    })
                  : gallerySelected.map(id => {
                      const item = galleryItems.find(g => g.id === id);
                      return item?.title || id;
                    });
              const newExport = {
                id: String(Date.now()),
                name: newName || 'New Export',
                format,
                status: 'processing',
                created: new Date().toISOString(),
                size: '0 MB',
                downloadCount: 0,
                includes: selectedContent,
                source,
                path: source === 'vault' ? vaultPath : undefined,
                items: source === 'vault' ? vaultSelected : gallerySelected,
                itemNames,
              };
              setExportsList(prev => [newExport, ...prev]);
              simulateProcessing(newExport.id);
              setAlert({ message: 'Export queued', type: 'success' });
              setNewName('');
              setFormat('zip');
              setVaultSelected([]);
              setGallerySelected([]);
              setShowCreateModal(false);
            }}
          >
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Export Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              {exportFormats.map((fmt) => (
                <option key={fmt.id} value={fmt.id}>{fmt.name}</option>
              ))}
            </select>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={source}
              onChange={(e) => setSource(e.target.value as 'vault' | 'gallery')}
            >
              <option value="vault">Vault Files</option>
              <option value="gallery">Gallery Media</option>
            </select>
            {source === 'vault' && (
              <>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={vaultPath.join('/')}
                  onChange={(e) => setVaultPath(e.target.value ? e.target.value.split('/') : [])}
                >
                  {folderOptions.map((opt) => (
                    <option key={opt.path.join('/')} value={opt.path.join('/')}>{opt.label}</option>
                  ))}
                </select>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {getItemsAtPath(vaultStructure, vaultPath).map(item => (
                    <label key={item.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={vaultSelected.includes(item.id)}
                        onChange={(e) =>
                          setVaultSelected((prev) =>
                            e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                          )
                        }
                      />
                      <span>{item.name}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
            {source === 'gallery' && (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                {galleryItems.map(item => (
                  <label key={item.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={gallerySelected.includes(item.id)}
                      onChange={(e) =>
                        setGallerySelected((prev) =>
                          e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                        )
                      }
                    />
                    <span>{item.title}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setVaultSelected([]);
                  setGallerySelected([]);
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {detailsExport && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{detailsExport.name}</h3>
          <p className="text-sm text-gray-500">Format: {detailsExport.format}</p>
          <p className="text-sm text-gray-500">Size: {detailsExport.size}</p>
          <p className="text-sm text-gray-500">Created: {formatDate(detailsExport.created)}</p>
          {detailsExport.source && (
            <p className="text-sm text-gray-500">
              Source: {detailsExport.source}
              {detailsExport.path && (
                <> &nbsp;| Path: {detailsExport.path.length ? detailsExport.path.join(' / ') : 'Root'}</>
              )}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {detailsExport.includes.map((inc: string) => (
              <span key={inc} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {inc}
              </span>
            ))}
            {detailsExport.itemNames && detailsExport.itemNames.map((n: string) => (
              <span key={n} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {n}
              </span>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setDetailsExport(null)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {deleteId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Delete Export?</h3>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteExport(deleteId)}
              className="px-4 py-2 rounded-lg bg-red-600 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}