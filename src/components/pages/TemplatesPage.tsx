import React, { useEffect, useState } from 'react';
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
import { FileUpload } from '../FileUpload';

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'free' | 'premium';
  preview: string;
  author: string;
  downloads: number;
  rating: number;
  lastUpdated: string;
  featured: boolean;
  tags: string[];
}


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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderSections, setBuilderSections] = useState<string[]>(['Header', 'Content', 'Images']);
  const [sectionInput, setSectionInput] = useState('');
  const [viewTemplate, setViewTemplate] = useState<TemplateItem | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'timeline',
    type: 'free',
    tags: '',
    preview: ''
  });
  const [templates, setTemplates] = useState<TemplateItem[]>(() => {
    const stored = localStorage.getItem('vault_templates');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('vault_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredTemplates = templates.filter(template => {
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

  const handleView = (template: TemplateItem) => {
    setViewTemplate(template);
  };

  const handleDownload = (template: TemplateItem) => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('Template downloaded');
  };

  const handleCopy = (template: TemplateItem) => {
    navigator.clipboard.writeText(JSON.stringify(template, null, 2));
    setToast('Template copied to clipboard');
  };

const openCreate = () => {
  setEditingId(null);
  setForm({ name: '', description: '', category: 'timeline', type: 'free', tags: '', preview: '', attachments: [] });
  setShowCreateModal(true);
};

  const openEdit = (template: TemplateItem) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      description: template.description,
      category: template.category,
      type: template.type,
      tags: template.tags.join(', '),
      preview: template.preview,
      attachments: template.attachments ? [...template.attachments] : []
    });
    setShowCreateModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      setToast('Template deleted');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTemplate: TemplateItem = {
      id: editingId ?? Date.now().toString(),
      name: form.name,
      description: form.description,
      category: form.category,
      type: form.type as 'free' | 'premium',
      preview: form.preview || 'https://via.placeholder.com/400x300?text=Preview',
      author: 'You',
      downloads: editingId ? templates.find(t => t.id === editingId)!.downloads : 0,
      rating: editingId ? templates.find(t => t.id === editingId)!.rating : 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      featured: editingId ? templates.find(t => t.id === editingId)!.featured : false,
      tags: form.tags ? form.tags.split(/,\s*/) : [],
      attachments: form.attachments.map(f => f.name)
    };

    setTemplates(prev => {
      if (editingId) {
        return prev.map(t => (t.id === editingId ? newTemplate : t));
      }
      return [newTemplate, ...prev];
    });
    setShowCreateModal(false);
    setEditingId(null);
    setForm({ name: '', description: '', category: 'timeline', type: 'free', tags: '', preview: '', attachments: [] });
    setToast(editingId ? 'Template updated' : 'Template created');
  };

  const addSection = () => {
    if (!sectionInput.trim()) return;
    setBuilderSections(prev => [...prev, sectionInput.trim()]);
    setSectionInput('');
  };

  const removeSection = (index: number) => {
    setBuilderSections(prev => prev.filter((_, i) => i !== index));
  };

  const exportBuilder = () => {
    const blob = new Blob([JSON.stringify(builderSections, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-builder.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
      {/* Glassy Animated Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-10 pb-8 mb-6 rounded-3xl bg-white/60 backdrop-blur-lg shadow-xl border border-white/30 overflow-hidden" style={{background: 'linear-gradient(120deg,rgba(59,130,246,0.10),rgba(236,72,153,0.10) 100%)'}}>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm tracking-tight">Templates</h1>
          <p className="mt-2 text-lg text-gray-700">Pre-built layouts and structures for your content</p>
        </div>
        <div className="mt-6 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowBuilder(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white/80 hover:bg-blue-50 shadow transition"
          >
            <Palette className="h-4 w-4 mr-2" />
            Template Builder
          </button>
          <button
            onClick={openCreate}
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
          { icon: <FileText className="h-7 w-7 text-blue-600" />, label: 'Total Templates', value: templates.length, color: 'from-blue-100 to-blue-50' },
          { icon: <Download className="h-7 w-7 text-green-600" />, label: 'Downloads', value: templates.reduce((sum, t) => sum + t.downloads, 0).toLocaleString(), color: 'from-green-100 to-green-50' },
          { icon: <Star className="h-7 w-7 text-yellow-600" />, label: 'Featured', value: templates.filter(t => t.featured).length, color: 'from-yellow-100 to-yellow-50' },
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
      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowCreateModal(false)}>
              <Trash2 className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{editingId ? 'Edit Template' : 'Create New Template'}</h2>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Template Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {categories.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Preview URL"
                value={form.preview}
                onChange={e => setForm({ ...form, preview: e.target.value })}
              />
              <div className="w-full">
                <FileUpload
                  accept="image/*"
                  multiple
                  onFilesSelected={files =>
                    setForm({ ...form, attachments: Array.from(files) })
                  }
                />
              </div>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
              />
              <div className="flex space-x-2">
                <button type="button" className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">{editingId ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative animate-fade-in">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowBuilder(false)}>
              <Trash2 className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Template Builder</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {builderSections.map((sec, i) => (
                <div key={i} className="flex items-center justify-between border rounded px-3 py-2">
                  <span>{sec}</span>
                  <button className="text-red-500" onClick={() => removeSection(i)}>&times;</button>
                </div>
              ))}
            </div>
            <div className="flex mt-4 space-x-2">
              <input
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2"
                placeholder="New section"
                value={sectionInput}
                onChange={e => setSectionInput(e.target.value)}
              />
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={addSection}>Add</button>
            </div>
            <div className="flex mt-6 justify-end space-x-2">
              <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700" onClick={() => setShowBuilder(false)}>Close</button>
              <button className="px-4 py-2 rounded-lg bg-green-600 text-white" onClick={exportBuilder}>Download JSON</button>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {viewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setViewTemplate(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative animate-fade-in" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setViewTemplate(null)}>
              <Trash2 className="h-5 w-5" />
            </button>
            <img src={viewTemplate.preview} alt={viewTemplate.name} className="w-full h-64 object-cover rounded mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-900">{viewTemplate.name}</h3>
            <p className="text-gray-700 mb-2">{viewTemplate.description}</p>
            <div className="flex flex-wrap gap-2">
              {viewTemplate.tags.map(t => (
                <span key={t} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{t}</span>
              ))}
              {viewTemplate.attachments && viewTemplate.attachments.map(name => (
                <span key={name} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {name}
                </span>
              ))}
            </div>
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
                        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50" onClick={() => handleView(template)}>
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50" onClick={() => handleDownload(template)}>
                          <Download className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50" onClick={() => handleCopy(template)}>
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
                      {template.attachments && template.attachments.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {template.attachments.length} files
                        </span>
                      )}
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
                        {template.attachments && (
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {template.attachments.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" onClick={() => handleView(template)}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50" onClick={() => handleDownload(template)}>
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" onClick={() => handleCopy(template)}>
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50" onClick={() => openEdit(template)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="h-4 w-4" />
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