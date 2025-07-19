import React, { useState, useEffect } from 'react';
import { 
  Image, 
  Video, 
  Play, 
  Download, 
  Share2, 
  Heart, 
  Eye, 
  Search,
  Grid3X3, 
  List, 
  Plus,
  Camera,
  Film,
  Palette,
  MoreHorizontal,
  Star,
  Calendar,
  MapPin,
  Tag
} from 'lucide-react';
import { UploadMediaModal } from '../UploadMediaModal';

interface GalleryItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  date: string;
  location: string;
  views: number;
  likes: number;
  tags: string[];
  featured: boolean;
  duration?: string;
}
const exhibitions: Array<{id: string; title: string; description: string; itemCount: number; featured: boolean; thumbnail: string;}> = [];





// Lightbox Modal for viewing images/videos
interface LightboxModalProps {
  item: GalleryItem;
  onClose: () => void;
}

function LightboxModal({ item, onClose }: LightboxModalProps) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white/90 rounded-2xl shadow-2xl p-4 max-w-2xl w-full flex flex-col items-center">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={onClose}>&times;</button>
        <div className="w-full flex flex-col items-center">
          {item.type === 'image' ? (
            <img src={item.url} alt={item.title} className="rounded-xl max-h-[60vh] object-contain" />
          ) : (
            <video src={item.url} controls className="rounded-xl max-h-[60vh] w-full object-contain" />
          )}
          <div className="mt-4 w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
              <Calendar className="h-4 w-4 mr-1" />{item.date}
              <MapPin className="h-4 w-4 mr-1" />{item.location}
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <Eye className="h-4 w-4 mr-1" />{item.views}
              <Heart className="h-4 w-4 mr-1" />{item.likes}
              {item.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium ml-1">
                  <Tag className="h-3 w-3 mr-1" />{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showExhibitions, setShowExhibitions] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const stored = localStorage.getItem('gallery_items');
    return stored ? JSON.parse(stored) : [];
  });
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('gallery_items', JSON.stringify(galleryItems));
  }, [galleryItems]);

  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('video') ? 'video' : 'image';
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      title: file.name,
      type,
      url,
      thumbnail: url,
      date: new Date().toISOString().split('T')[0],
      location: 'Unknown',
      views: 0,
      likes: 0,
      tags: [],
      featured: false,
      duration: type === 'video' ? '' : undefined,
    };
    setGalleryItems((prev) => [newItem, ...prev]);
  };

  const handleLike = (id: string) => {
    setGalleryItems((items) =>
      items.map((it) => (it.id === id ? { ...it, likes: it.likes + 1 } : it))
    );
  };

  const handleDownload = (item: GalleryItem) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.title;
    link.click();
  };

  const handleShare = async (item: GalleryItem) => {
    const shareData = { title: item.title, url: item.url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(item.url);
        alert('Link copied to clipboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="relative min-h-screen pb-20">
      {/* Animated Glassy Hero Header */}
      <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl shadow-lg px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm flex items-center gap-2">
            <Camera className="h-8 w-8 text-blue-500 animate-bounce" />
            Gallery
          </h1>
          <p className="mt-2 text-lg text-gray-600">Visual showcase of your digital heritage</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={() => setShowExhibitions(!showExhibitions)}
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-base font-semibold text-blue-700 bg-gradient-to-r from-blue-100 to-purple-100 shadow hover:scale-105 transition-transform border border-blue-200"
          >
            <Palette className="h-5 w-5 mr-2" />
            Exhibitions
          </button>
          <button onClick={() => setShowUploadModal(true)} className="inline-flex items-center px-5 py-2.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg hover:scale-105 transition-transform">
            <Plus className="h-5 w-5 mr-2" />
            Add Media
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 animate-fade-in">
        <div className="glass-card flex items-center">
          <div className="p-3 bg-blue-100 rounded-xl shadow">
            <Image className="h-7 w-7 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Images</p>
            <p className="text-2xl font-extrabold text-gray-900">1,247</p>
          </div>
        </div>
        <div className="glass-card flex items-center">
          <div className="p-3 bg-purple-100 rounded-xl shadow">
            <Video className="h-7 w-7 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Videos</p>
            <p className="text-2xl font-extrabold text-gray-900">89</p>
          </div>
        </div>
        <div className="glass-card flex items-center">
          <div className="p-3 bg-green-100 rounded-xl shadow">
            <Eye className="h-7 w-7 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Views</p>
            <p className="text-2xl font-extrabold text-gray-900">12,456</p>
          </div>
        </div>
        <div className="glass-card flex items-center">
          <div className="p-3 bg-red-100 rounded-xl shadow">
            <Heart className="h-7 w-7 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Likes</p>
            <p className="text-2xl font-extrabold text-gray-900">891</p>
          </div>
        </div>
      </div>

      {/* Exhibitions Section */}
      {showExhibitions && (
        <div className="glass-card p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" /> Featured Exhibitions
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              <Plus className="h-4 w-4 mr-1" />Create Exhibition
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {exhibitions.map((exhibition) => (
              <div key={exhibition.id} className={`rounded-2xl overflow-hidden shadow-xl border-2 ${exhibition.featured ? 'border-yellow-300' : 'border-gray-200'} bg-gradient-to-br from-white/90 to-blue-50/80 hover:scale-[1.02] transition-transform`}>
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={exhibition.thumbnail} 
                    alt={exhibition.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{exhibition.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{exhibition.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{exhibition.itemCount} items</p>
                    </div>
                    {exhibition.featured && (
                      <Star className="h-5 w-5 text-yellow-400 fill-current animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="glass-card p-6 mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
            >
              <option value="all">All Media</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
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

      {/* Gallery Grid/List */}
      <div className="glass-card p-6 relative animate-fade-in">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <div key={item.id} className="group relative bg-gradient-to-br from-white/90 to-blue-50/80 rounded-2xl overflow-hidden shadow-xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => setLightboxItem(item)}>
                <div className="aspect-w-4 aspect-h-3 relative">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-3">
                        <Play className="h-6 w-6 text-white fill-current animate-pulse" />
                      </div>
                    </div>
                  )}
                  {item.featured && (
                    <div className="absolute top-2 left-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current animate-pulse" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                      title="More"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      className="p-1 bg-white rounded shadow-sm hover:bg-blue-50"
                      title="Download"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                    >
                      <Download className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      className="p-1 bg-white rounded shadow-sm hover:bg-red-50"
                      title="Like"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(item.id);
                      }}
                    >
                      <Heart className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  {item.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {item.duration}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 truncate flex items-center gap-2">
                    {item.type === 'image' ? <Image className="h-4 w-4 text-blue-400" /> : <Film className="h-4 w-4 text-purple-400" />}
                    {item.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {item.date}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {item.views}
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {item.likes}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Tag className="h-3 w-3 mr-1" />{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-6 hover:bg-blue-50/40 cursor-pointer" onClick={() => setLightboxItem(item)}>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white fill-current animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      {item.type === 'image' ? <Image className="h-4 w-4 text-blue-400" /> : <Film className="h-4 w-4 text-purple-400" />}
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{item.date}</span>
                      <span>{item.location}</span>
                      <span>{item.views} views</span>
                      <span>{item.likes} likes</span>
                    </div>
                    <div className="flex space-x-1 mt-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Tag className="h-3 w-3 mr-1" />{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="View"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxItem(item);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-green-600"
                    title="Download"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Share"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(item);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Like"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(item.id);
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Add Media Button */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400 animate-bounce"
          title="Add Media"
        >
          <Plus className="h-7 w-7" />
        </button>

        {/* Lightbox Modal */}
        {lightboxItem && (
          <LightboxModal item={lightboxItem} onClose={() => setLightboxItem(null)} />
        )}
        {showUploadModal && (
          <UploadMediaModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUpload}
          />
        )}
      </div>

      {/* Custom Styles for glass and animation */}
      <style>{`
        .glass-card {
          @apply bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-6;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes pulse-timeline {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 16px 4px rgba(168,85,247,0.15); }
        }
        .animate-pulse-timeline {
          animation: pulse-timeline 2.5s infinite;
        }
      `}</style>
    </div>
  );
}