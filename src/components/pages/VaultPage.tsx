import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FolderPlus,
  Upload,
  Star,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface VaultItem {
  id: string;
  name: string;
  type: string;
  size: string | null;
  modified: string;
  owner: string;
  starred: boolean;
  url?: string;
  children?: VaultItem[];
}

export function VaultPage() {
  const defaultFiles: VaultItem[] = [
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      size: null,
      modified: '2024-01-15',
      owner: 'John Doe',
      starred: false,
      children: [],
    },
    {
      id: '2',
      name: 'Images',
      type: 'folder',
      size: null,
      modified: '2024-01-14',
      owner: 'John Doe',
      starred: true,
      children: [],
    },
    {
      id: 3,
      name: 'Project Proposal.pdf',
      type: 'pdf',
      size: '2.4 MB',
      modified: '2024-01-13',
      owner: 'Jane Smith',
      starred: false
    },
    {
      id: 4,
      name: 'Presentation.pptx',
      type: 'presentation',
      size: '5.1 MB',
      modified: '2024-01-12',
      owner: 'Mike Johnson',
      starred: true
    },
    {
      id: 5,
      name: 'Budget_2024.xlsx',
      type: 'spreadsheet',
      size: '1.8 MB',
      modified: '2024-01-11',
      owner: 'Sarah Wilson',
      starred: false
    },
    {
      id: 6,
      name: 'Team_Photo.jpg',
      type: 'image',
      size: '3.2 MB',
      modified: '2024-01-10',
      owner: 'John Doe',
      starred: false
    }
  ];

  const [structure, setStructure] = useState<VaultItem[]>(() => {
    const stored = localStorage.getItem('vault_files');
    return stored ? JSON.parse(stored) : defaultFiles;
  });
  const [previewFile, setPreviewFile] = useState<VaultItem | null>(null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <FolderPlus className="h-8 w-8 text-blue-500" />;
      case 'pdf':
      case 'document':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'image':
        return <Image className="h-8 w-8 text-green-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-purple-500" />;
      case 'audio':
        return <Music className="h-8 w-8 text-orange-500" />;
      case 'archive':
        return <Archive className="h-8 w-8 text-yellow-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selected, setSelected] = useState<VaultItem | null>(null);
  const [renameName, setRenameName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [path, setPath] = useState<string[]>([]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const detectType = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'mp4':
      case 'mov':
        return 'video';
      case 'mp3':
        return 'audio';
      case 'zip':
      case 'rar':
        return 'archive';
      case 'pptx':
        return 'presentation';
      case 'xlsx':
        return 'spreadsheet';
      default:
        return 'document';
    }
  };

  const getItemsAtPath = (items: VaultItem[], p: string[]): VaultItem[] => {
    let current = items;
    for (const id of p) {
      const folder = current.find((i) => i.id === id && i.type === 'folder');
      if (!folder) return [];
      current = folder.children || [];
    }
    return current;
  };

  const updateAtPath = (
    p: string[],
    updater: (items: VaultItem[]) => VaultItem[]
  ) => {
    setStructure((prev) => {
      const update = (list: VaultItem[], pathSegs: string[]): VaultItem[] => {
        if (pathSegs.length === 0) return updater(list);
        return list.map((item) => {
          if (item.id !== pathSegs[0] || item.type !== 'folder') return item;
          return {
            ...item,
            children: update(item.children || [], pathSegs.slice(1)),
          };
        });
      };
      return update(prev, p);
    });
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject();
      reader.readAsDataURL(file);
    });

  const handleFiles = async (fileList: FileList) => {
    const arr = Array.from(fileList);
    const newFiles: VaultItem[] = await Promise.all(
      arr.map(async (f) => ({
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        name: f.name,
        type: detectType(f.name),
        size: formatBytes(f.size),
        modified: new Date().toISOString().slice(0, 10),
        owner: 'You',
        starred: false,
        url: await toBase64(f),
      }))
    );
    updateAtPath(path, (prev) => [...newFiles, ...prev]);
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const createFolder = () => {
    const folder: VaultItem = {
      id: Date.now().toString(),
      name: newFolderName,
      type: 'folder',
      size: null,
      modified: new Date().toISOString().slice(0, 10),
      owner: 'You',
      starred: false,
      children: [],
    };
    updateAtPath(path, (prev) => [folder, ...prev]);
    setNewFolderName('');
    setShowFolderModal(false);
  };

  const toggleStar = (id: string) =>
    updateAtPath(path, (items) =>
      items.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f))
    );

  const deleteFile = (id: string) =>
    updateAtPath(path, (items) => items.filter((f) => f.id !== id));

  const openRename = (file: VaultItem) => {
    setSelected(file);
    setRenameName(file.name);
    setShowRenameModal(true);
  };

  const openPreview = (file: VaultItem) => {
    if (file.type === 'folder') {
      setPath((prev) => [...prev, file.id]);
    } else {
      setPreviewFile(file);
    }
  };

  const renameFile = () => {
    if (selected) {
      updateAtPath(path, (items) =>
        items.map((f) => (f.id === selected.id ? { ...f, name: renameName } : f))
      );
    }
    setShowRenameModal(false);
  };

  useEffect(() => {
    localStorage.setItem('vault_files', JSON.stringify(structure));
  }, [structure]);

  const currentFiles = useMemo(
    () => getItemsAtPath(structure, path),
    [structure, path]
  );

  const filteredFiles = currentFiles.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-orange-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-purple-500 to-orange-400 shadow-xl rounded-b-3xl mb-6">
        <div className="px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-2 flex items-center gap-3">
              <FolderPlus className="h-8 w-8 text-white animate-float" /> File Manager
            </h1>
            <p className="text-lg text-white/90 font-medium drop-shadow mb-2">Manage, preview, and organize your digital legacy files and folders.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold">Secure Storage</span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold">Fast Search</span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold">Rich Previews</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-300 via-purple-300 to-primary-300 flex items-center justify-center shadow-xl animate-float">
              <Upload className="h-12 w-12 text-white" />
            </div>
            <span className="text-white/80 text-sm mt-2">Drag & drop to upload</span>
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

        {/* Actions */}
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFolderModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <FolderPlus className="h-4 w-4 mr-2" /> New Folder
            </button>
            <button
              onClick={handleUploadClick}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Upload className="h-4 w-4 mr-2" /> Upload
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInput} />
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="px-6 text-sm mb-2 flex items-center flex-wrap gap-1">
          <button
            onClick={() => setPath([])}
            className="text-blue-600 hover:underline"
          >
            Root
          </button>
          {path.map((id, idx) => {
            const segPath = path.slice(0, idx);
            const folder = getItemsAtPath(structure, segPath).find((f) => f.id === id);
            return (
              <span key={id} className="flex items-center gap-1">
                <span>/</span>
                <button
                  onClick={() => setPath(path.slice(0, idx + 1))}
                  className="text-blue-600 hover:underline"
                >
                  {folder?.name || '...'}
                </button>
              </span>
            );
          })}
        </div>

        {/* Drag & Drop Upload Area */}
        <div className="mx-4 mb-6">
          <div
            className="border-2 border-dashed border-primary-300 rounded-2xl bg-white/60 p-8 flex flex-col items-center justify-center hover:bg-primary-50 transition-all duration-300 cursor-pointer"
            onClick={handleUploadClick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-primary-400 mb-2 animate-bounce" />
            <span className="text-primary-600 font-semibold">Drag & drop files here or click to upload</span>
          </div>
        </div>

        {/* File Grid */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <div key={file.id} className="relative bg-white rounded-lg border-2 p-4 hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggleStar(file.id)}
                  className="absolute top-2 right-2 p-1 text-yellow-500 hover:text-yellow-600"
                >
                  {file.starred ? <Star className="h-4 w-4 fill-current" /> : <Star className="h-4 w-4" />}
                </button>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3">{getFileIcon(file.type)}</div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate w-full mb-1">{file.name}</h3>
                  <p className="text-xs text-gray-500">{file.type === 'folder' ? `${file.children ? file.children.length : 0} items` : file.size}</p>
                  <p className="text-xs text-gray-400 mt-1">{file.modified}</p>
                </div>
                <div className="mt-2 flex justify-center space-x-2">
                  <button
                    onClick={() => openPreview(file)}
                    className="p-1 text-gray-400 hover:text-primary-600"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openRename(file)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">New Folder</h3>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  createFolder();
                }}
              >
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowFolderModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700">
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

        {showRenameModal && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rename</h3>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  renameFile();
                }}
              >
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowRenameModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreviewFile(null)}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{previewFile.name}</h3>
              {previewFile.url ? (
                previewFile.type === 'image' ? (
                  <img src={previewFile.url} alt={previewFile.name} className="max-h-96 w-auto mx-auto" />
                ) : previewFile.type === 'video' ? (
                  <video src={previewFile.url} controls className="max-h-96 w-full" />
                ) : previewFile.type === 'audio' ? (
                  <audio src={previewFile.url} controls className="w-full" />
                ) : (
                  <iframe src={previewFile.url} className="w-full h-96" title={previewFile.name} />
                )
              ) : (
                <p className="text-sm text-gray-500">No preview available.</p>
              )}
              <div className="flex justify-end mt-4">
                <button onClick={() => setPreviewFile(null)} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}