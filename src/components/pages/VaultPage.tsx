import { useState } from 'react';
import { FolderPlus, Upload, Star, FileText, Image, Video, Music, Archive, File } from 'lucide-react';

export function VaultPage() {
  const [files] = useState([
    {
      id: 1,
      name: 'Documents',
      type: 'folder',
      size: null,
      modified: '2024-01-15',
      owner: 'John Doe',
      starred: false,
      items: 24
    },
    {
      id: 2,
      name: 'Images',
      type: 'folder',
      size: null,
      modified: '2024-01-14',
      owner: 'John Doe',
      starred: true,
      items: 156
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
  ]);

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

      {/* Drag & Drop Upload Area */}
      <div className="mx-4 mb-6">
        <div className="border-2 border-dashed border-primary-300 rounded-2xl bg-white/60 p-8 flex flex-col items-center justify-center hover:bg-primary-50 transition-all duration-300 cursor-pointer">
          <Upload className="h-10 w-10 text-primary-400 mb-2 animate-bounce" />
          <span className="text-primary-600 font-semibold">Drag & drop files here or click to upload</span>
        </div>
      </div>

      {/* File Grid */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {files.map((file: any) => (
            <div key={file.id} className="relative bg-white rounded-lg border-2 p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3">{getFileIcon(file.type)}</div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate w-full mb-1">{file.name}</h3>
                <p className="text-xs text-gray-500">{file.type === 'folder' ? `${file.items} items` : file.size}</p>
                <p className="text-xs text-gray-400 mt-1">{file.modified}</p>
              </div>
              {file.starred && (
                <Star className="absolute top-2 right-2 h-4 w-4 text-yellow-500 fill-current" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}