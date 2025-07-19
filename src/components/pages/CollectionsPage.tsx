import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Eye, 
  Share2, 
  Edit, 
  Trash2,
  FolderOpen,
  ImageIcon,
  Lock,
  Globe
} from 'lucide-react';
import { FileManager, VaultItem } from '../FileManager';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCollections, createCollection, updateCollection, removeCollection, Collection as ApiCollection } from '../../utils/collections';

interface Collection extends ApiCollection {}


export function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionFiles, setCollectionFiles] = useState<Record<string, VaultItem[]>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [newPassword, setNewPassword] = useState('');

  const [authorized, setAuthorized] = useState<Record<string, boolean>>({});
  const [passwordItem, setPasswordItem] = useState<Collection | null>(null);
  const [passwordInput, setPasswordInput] = useState('');

  const [viewItem, setViewItem] = useState<Collection | null>(null);
  const [shareItem, setShareItem] = useState<Collection | null>(null);
  const [editItem, setEditItem] = useState<Collection | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleteItem, setDeleteItem] = useState<Collection | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const data = await fetchCollections(token);
        setCollections(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [token]);

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openCollection = (collection: Collection) => {
    if (collection.isPublic || authorized[collection.id]) {
      setViewItem(collection);
    } else {
      setPasswordItem(collection);
      setPasswordInput('');
    }
  };

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Collections</h1>
          <p className="mt-2 text-gray-600">Organize your assets into meaningful collections</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Collection
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Collections</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{collections.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ImageIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {collections.reduce((sum, col) => sum + col.assetCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Public</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {collections.filter(col => col.isPublic).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Lock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Private</p>
              <p className="text-2xl font-bold text-gray-900">
                {collections.filter(col => !col.isPublic).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Grid/List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200">
                <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-100 to-purple-100 p-8 flex items-center justify-center">
                  <FolderOpen className="h-12 w-12 text-blue-600" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-200">
                      {collection.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {collection.isPublic ? (
                        <Globe className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{collection.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">{collection.assetCount} assets</span>
                    <span className="text-sm text-gray-500">{collection.createdAt}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {collection.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openCollection(collection)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setShareItem(collection);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditItem(collection);
                          setEditName(collection.name);
                          setEditDesc(collection.description);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteItem(collection)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="flex items-center justify-between p-6 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                    <FolderOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{collection.name}</h3>
                      {collection.isPublic ? (
                        <Globe className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{collection.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{collection.assetCount} assets</span>
                      <span>{collection.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-1">
                    {collection.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openCollection(collection)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShareItem(collection)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditItem(collection);
                        setEditName(collection.name);
                        setEditDesc(collection.description);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteItem(collection)}
                      className="p-2 text-gray-400 hover:text-red-600"
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
    </div>

    {showCreateModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Collection</h3>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!token) return;
              try {
                const created = await createCollection(token, {
                  name: newName,
                  description: newDesc,
                  assetCount: 0,
                  isPublic: newIsPublic,
                  password: newIsPublic ? '' : newPassword,
                  createdAt: new Date().toISOString().slice(0,10),
                  thumbnail: '',
                  tags: ''
                });
                setCollections(prev => [created, ...prev]);
              } catch (err) {
                console.error(err);
              }
              setNewName('');
              setNewDesc('');
              setNewPassword('');
              setNewIsPublic(true);
              setShowCreateModal(false);
            }}
          >
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-1">
                <input
                  type="radio"
                  checked={newIsPublic}
                  onChange={() => setNewIsPublic(true)}
                />
                <span>Public</span>
              </label>
              <label className="flex items-center space-x-1">
                <input
                  type="radio"
                  checked={!newIsPublic}
                  onChange={() => setNewIsPublic(false)}
                />
                <span>Private</span>
              </label>
            </div>
            {!newIsPublic && (
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {passwordItem && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPasswordItem(null)}>
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Password</h3>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (passwordInput === (passwordItem.password || '')) {
                setAuthorized((prev) => ({ ...prev, [passwordItem.id]: true }));
                setPasswordItem(null);
                setViewItem(passwordItem);
              }
            }}
          >
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
            />
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setPasswordItem(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Unlock</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {viewItem && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setViewItem(null)}>
        <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{viewItem.name}</h3>
            <button onClick={() => setViewItem(null)} className="text-gray-500 hover:text-red-600">&times;</button>
          </div>
          <FileManager
            initialItems={collectionFiles[viewItem.id] || []}
            onChange={(items) =>
              setCollectionFiles((prev) => ({ ...prev, [viewItem.id]: items }))
            }
          />
        </div>
      </div>
    )}

    {shareItem && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShareItem(null)}>
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share {shareItem.name}</h3>
          <div className="flex items-center mb-4">
            <input
              readOnly
              value={`https://vault.example.com/collections/${shareItem.id}`}
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(`https://vault.example.com/collections/${shareItem.id}`)}
              className="px-3 py-2 bg-blue-600 text-white rounded-r-lg"
            >
              Copy
            </button>
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700" onClick={() => setShareItem(null)}>Close</button>
          </div>
        </div>
      </div>
    )}

    {editItem && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditItem(null)}>
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Collection</h3>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!token || !editItem) return;
              try {
                await updateCollection(token, editItem.id as any, { ...editItem, name: editName, description: editDesc });
                setCollections(prev => prev.map(c => c.id === editItem.id ? { ...c, name: editName, description: editDesc } : c));
              } catch (err) {
                console.error(err);
              }
              setEditItem(null);
            }}
          >
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Save</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {deleteItem && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteItem(null)}>
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete {deleteItem.name}?</h3>
          <div className="flex justify-end space-x-2">
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700" onClick={() => setDeleteItem(null)}>Cancel</button>
            <button
              className="px-4 py-2 rounded-lg bg-red-600 text-white"
              onClick={async () => {
                if (!token || !deleteItem) return;
                try {
                  await removeCollection(token, deleteItem.id as any);
                  setCollections(prev => prev.filter(c => c.id !== deleteItem.id));
                } catch (err) {
                  console.error(err);
                }
                setDeleteItem(null);
              }}
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
