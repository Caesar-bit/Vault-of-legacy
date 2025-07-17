import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  FileText, 
  Link, 
  Quote, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Filter, 
  Calendar, 
  User, 
  Globe,
  Archive,
  Bookmark,
  Edit,
  Trash2,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react';

// Mock data
const mockResearchItems = [
  {
    id: '1',
    title: 'Birth Records - Springfield Hospital 1950',
    type: 'document',
    source: 'Springfield County Archives',
    date: '1950-03-15',
    verified: true,
    reliability: 'high',
    notes: 'Official birth certificate obtained from county records office',
    citations: ['Springfield County Birth Records, Vol. 23, Page 156'],
    tags: ['birth', 'official', 'hospital'],
    attachments: ['birth_certificate.pdf']
  },
  {
    id: '2',
    title: 'Military Service Record - John Smith',
    type: 'military',
    source: 'National Archives',
    date: '1968-1970',
    verified: true,
    reliability: 'high',
    notes: 'Service record from Vietnam War era, includes commendations',
    citations: ['National Personnel Records Center, Military Personnel File'],
    tags: ['military', 'vietnam', 'service'],
    attachments: ['service_record.pdf', 'commendations.pdf']
  },
  {
    id: '3',
    title: 'Immigration Records - Ellis Island',
    type: 'immigration',
    source: 'Ellis Island Foundation',
    date: '1923-04-12',
    verified: false,
    reliability: 'medium',
    notes: 'Passenger manifest shows arrival from Ireland, need to verify spelling of surname',
    citations: ['Ellis Island Passenger Lists, Ship: SS Celtic'],
    tags: ['immigration', 'ireland', 'ellis island'],
    attachments: ['passenger_manifest.jpg']
  },
  {
    id: '4',
    title: 'Marriage License - Smith & Johnson',
    type: 'vital',
    source: 'Springfield City Hall',
    date: '1972-08-20',
    verified: true,
    reliability: 'high',
    notes: 'Original marriage license with witness signatures',
    citations: ['Springfield Marriage Records, License #ML-1972-0856'],
    tags: ['marriage', 'license', 'official'],
    attachments: ['marriage_license.pdf']
  }
];

const researchSources = [
  { name: 'National Archives', type: 'government', reliability: 'high', count: 23 },
  { name: 'FamilySearch', type: 'genealogy', reliability: 'high', count: 45 },
  { name: 'Ancestry.com', type: 'genealogy', reliability: 'medium', count: 67 },
  { name: 'Local Libraries', type: 'library', reliability: 'medium', count: 12 },
  { name: 'Newspaper Archives', type: 'media', reliability: 'medium', count: 8 },
  { name: 'Personal Collection', type: 'personal', reliability: 'high', count: 156 }
];


export function ResearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterReliability, setFilterReliability] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Glassy color helpers
  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'military': return Archive;
      case 'immigration': return Globe;
      case 'vital': return BookOpen;
      default: return FileText;
    }
  };

  return (
    <div className="relative min-h-screen pb-24">
      {/* Animated Glassy Hero */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-10 pb-8 mb-6 rounded-3xl bg-white/60 backdrop-blur-lg shadow-xl border border-white/30 overflow-hidden" style={{background: 'linear-gradient(120deg,rgba(59,130,246,0.08),rgba(236,72,153,0.08) 100%)'}}>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">Research Center</h1>
          <p className="mt-2 text-lg text-gray-700">Document sources, verify facts, and manage citations</p>
        </div>
        <div className="mt-6 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white/80 hover:bg-blue-50 shadow transition">
            <Download className="h-4 w-4 mr-2" />
            Export Bibliography
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-pink-500 shadow-lg hover:scale-105 hover:shadow-xl transition"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Research
          </button>
        </div>
        {/* Animated background blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl animate-pulse z-0" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl animate-pulse z-0" />
      </div>

      {/* Animated Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { icon: <BookOpen className="h-7 w-7 text-blue-600" />, label: 'Total Sources', value: 156, color: 'from-blue-100 to-blue-50' },
          { icon: <CheckCircle className="h-7 w-7 text-green-600" />, label: 'Verified', value: '89%', color: 'from-green-100 to-green-50' },
          { icon: <Quote className="h-7 w-7 text-purple-600" />, label: 'Citations', value: 234, color: 'from-purple-100 to-purple-50' },
          { icon: <AlertTriangle className="h-7 w-7 text-orange-600" />, label: 'Needs Review', value: 12, color: 'from-orange-100 to-orange-50' },
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

      {/* Interactive Research Sources */}
      <div className="bg-white/70 rounded-3xl border border-white/30 p-6 mb-6 shadow-xl backdrop-blur-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Research Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {researchSources.map((source, i) => (
            <div key={source.name} className="glassy-card border border-white/40 rounded-2xl p-5 shadow-lg hover:scale-[1.03] hover:shadow-2xl transition group relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-400/10 rounded-full blur-xl group-hover:scale-125 transition" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition">{source.name}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getReliabilityColor(source.reliability)}`}>{source.reliability}</span>
              </div>
              <p className="text-sm text-gray-600 capitalize relative z-10">{source.type}</p>
              <p className="text-xs text-gray-500 mt-1 relative z-10">{source.count} records</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 p-6 rounded-3xl border border-white/30 shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 backdrop-blur-lg">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search research items..."
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
            <option value="document">Documents</option>
            <option value="military">Military</option>
            <option value="immigration">Immigration</option>
            <option value="vital">Vital Records</option>
          </select>
          <select
            value={filterReliability}
            onChange={(e) => setFilterReliability(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 shadow"
          >
            <option value="all">All Reliability</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        {/* Floating filter button for mobile */}
        <button className="sm:hidden fixed bottom-24 right-6 z-30 bg-gradient-to-r from-blue-600 to-pink-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition">
          <Filter className="h-6 w-6" />
        </button>
      </div>

      {/* Interactive Research Items */}
      <div className="bg-white/70 rounded-3xl border border-white/30 shadow-xl backdrop-blur-lg">
        <div className="px-6 py-4 border-b border-white/30">
          <h3 className="text-lg font-bold text-gray-900">Research Items</h3>
        </div>
        <div className="divide-y divide-white/30">
          {mockResearchItems.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            const expanded = expandedItem === item.id;
            return (
              <div key={item.id} className={`transition-all duration-300 ${expanded ? 'bg-blue-50/40' : 'hover:bg-blue-50/20'} p-6 cursor-pointer group`} onClick={() => setExpandedItem(expanded ? null : item.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-pink-100 rounded-xl shadow">
                      <TypeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition">{item.title}</h4>
                        {item.verified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getReliabilityColor(item.reliability)}`}>{item.reliability} reliability</span>
                      </div>
                      <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {item.date}
                        </div>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          {item.source}
                        </div>
                      </div>
                      <div className={`transition-all duration-300 overflow-hidden ${expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} group-hover:opacity-100`}> 
                        <p className="text-gray-700 mb-3">{item.notes}</p>
                        <div className="space-y-2">
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700">Citations:</h5>
                            <ul className="text-sm text-gray-600 ml-4">
                              {item.citations.map((citation, index) => (
                                <li key={index} className="list-disc">{citation}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Tags:</span>
                            {item.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{tag}</span>
                            ))}
                          </div>
                          {item.attachments.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Attachments:</span>
                              {item.attachments.map((attachment, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {attachment}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition" onClick={e => {e.stopPropagation();}}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition" onClick={e => {e.stopPropagation();}}>
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition" onClick={e => {e.stopPropagation();}}>
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition" onClick={e => {e.stopPropagation();}}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-blue-600 to-pink-500 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition flex items-center justify-center animate-bounce"
        title="Add Research"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Add Research Modal (UI only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowAddModal(false)}>
              <Trash2 className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Add New Research</h2>
            <form className="space-y-4">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Title" />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Source" />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Date" />
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Notes" />
              <div className="flex space-x-2">
                <button type="button" className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Add</button>
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
    </div>
  );
}