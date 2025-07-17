import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Edit, 
  Trash2, 
  Copy,
  Star,
  Clock,
  User,
  Grid3X3,
  List,
  Palette,
  Layout,
  Image,
  Calendar
} from 'lucide-react';

const mockTemplates = [
  {
    id: '1',
    name: 'Family Heritage Timeline',
    description: 'A comprehensive timeline template for documenting family history across generations',
    category: 'timeline',
    type: 'premium',
    preview: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?w=400',
    author: 'Vault Team',
    downloads: 1247,
    rating: 4.8,
    lastUpdated: '2024-01-15',
    featured: true,
    tags: ['family', 'timeline', 'heritage']
  },
  {
    id: '2',
    name: 'Wedding Memory Book',
    description: 'Beautiful template for creating wedding photo albums and memory collections',
    category: 'gallery',
    type: 'free',
    preview: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?w=400',
    author: 'Sarah Johnson',
    downloads: 856,
    rating: 4.6,
    lastUpdated: '2024-01-10',
    featured: false,
    tags: ['wedding', 'photos', 'memories']
  },
  {
    id: '3',
    name: 'Military Service Archive',
    description: 'Specialized template for documenting military service records and achievements',
    category: 'archive',
    type: 'premium',
    preview: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?w=400',
    author: 'Robert Wilson',
    downloads: 432,
    rating: 4.9,
    lastUpdated: '2024-01-08',
    featured: true,
    tags: ['military', 'service', 'documents']
  },
  {
    id: '4',
    name: 'Childhood Memories',
    description: 'Playful template perfect for organizing childhood photos and stories',
    category: 'collection',
    type: 'free',
    preview: 'https://images.pexels.com/photos/1104007/pexels-photo-1104007.jpeg?w=400',
    author: 'Mary Davis',
    downloads: 623,
    rating: 4.4,
    lastUpdated: '2024-01-05',
    featured: false,
    tags: ['childhood', 'photos', 'stories']
  },
  {
    id: '5',
    name: 'Research Documentation',
    description: 'Professional template for organizing research notes and citations',
    category: 'research',
    type: 'premium',
    preview: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?w=400',
    author: 'Dr. James Smith',
    downloads: 289,
    rating: 4.7,
    lastUpdated: '2024-01-03',
    featured: false,
    tags: ['research', 'documentation', 'academic']
  },
  {
    id: '6',
    name: 'Travel Adventures',
    description: 'Dynamic template for documenting travel experiences and adventures',
    category: 'gallery',
    type: 'free',
    preview: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?w=400',
    author: 'Lisa Chen',
    downloads: 734,
    rating: 4.5,
    lastUpdated: '2023-12-28',
    featured: false,
    tags: ['travel', 'adventure', 'photos']
  }
];

const categories = [
  { id: 'all', name: 'All Templates', icon: Grid3X3 },
  { id: 'timeline', name: 'Timeline', icon: Clock },
  { id: 'gallery', name: 'Gallery', icon: Image },
  { id: 'archive', name: 'Archive', icon: FileText },
  { id: 'collection', name: 'Collection', icon: Layout },
  { id: 'research', name: 'Research', icon: Search }
];

export function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'free': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || FileText;
  };

  return (
    <div className="space-y-8">
      {/* Glassy Animated Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-10 pb-8 mb-6 rounded-3xl bg-white/60 backdrop-blur-lg shadow-xl border border-white/30 overflow-hidden" style={{background: 'linear-gradient(120deg,rgba(59,130,246,0.10),rgba(236,72,153,0.10) 100%)'}}>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm tracking-tight">Templates</h1>
          <p className="mt-2 text-lg text-gray-700">Pre-built layouts and structures for your content</p>
        </div>
        <div className="mt-6 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white/80 hover:bg-blue-50 shadow transition">
            <Palette className="h-4 w-4 mr-2" />
            Template Builder
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-pink-500 shadow-lg hover:scale-105 hover:shadow-xl transition"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </button>
        </div>
        {/* Animated background blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl animate-pulse z-0" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl animate-pulse z-0" />
      </div>

      {/* Animated Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { icon: <FileText className="h-7 w-7 text-blue-600" />, label: 'Total Templates', value: mockTemplates.length, color: 'from-blue-100 to-blue-50' },
          { icon: <Download className="h-7 w-7 text-green-600" />, label: 'Downloads', value: mockTemplates.reduce((sum, t) => sum + t.downloads, 0).toLocaleString(), color: 'from-green-100 to-green-50' },
          { icon: <Star className="h-7 w-7 text-yellow-600" />, label: 'Featured', value: mockTemplates.filter(t => t.featured).length, color: 'from-yellow-100 to-yellow-50' },
          { icon: <User className="h-7 w-7 text-purple-600" />, label: 'Contributors', value: 12, color: 'from-purple-100 to-purple-50' },
        ].map((stat, i) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl border border-white/40 shadow flex items-center space-x-4 glassy-card animate-fade-in`} style={{animationDelay: `${i * 80}ms`}}>
            <div className="p-3 bg-white/60 rounded-xl shadow">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="glassy-card rounded-3xl border border-white/30 shadow-xl backdrop-blur-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 p-6 rounded-3xl border border-white/30 shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 backdrop-blur-lg">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 shadow"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 shadow"
          >
            <option value="all">All Types</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
          <div className="flex border border-gray-200 rounded-xl">
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

      {/* Templates Grid/List */}
      <div className="glassy-card rounded-3xl border border-white/30 shadow-xl backdrop-blur-lg">
      {/* Create Template Modal (UI only, not floating) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowCreateModal(false)}>
              <Trash2 className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Create New Template</h2>
            <form className="space-y-4">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Template Name" />
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Description" />
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                <option value="">Select Category</option>
                {categories.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2">
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Tags (comma separated)" />
              <div className="flex space-x-2">
                <button type="button" className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <div key={template.id} className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200">
                  <div className="relative">
                    <img 
                      src={template.preview} 
                      alt={template.name}
                      className="w-full h-48 object-cover"
                    />
                    {template.featured && (
                      <div className="absolute top-2 left-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(template.type)}`}>
                        {template.type}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                          <Download className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                          <Copy className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h3>
                      <CategoryIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>{template.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{template.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{template.downloads} downloads</span>
                      <span>{template.lastUpdated}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <div key={template.id} className="flex items-center justify-between p-6 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={template.preview} 
                      alt={template.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        {template.featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(template.type)}`}>
                          {template.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {template.category}
                        </div>
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {template.author}
                        </div>
                        <div className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {template.downloads}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                          {template.rating}
                        </div>
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
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}