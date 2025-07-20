import React, { useState } from 'react';
import { useUserData } from '../../utils/userData';
import { FileUpload } from '../FileUpload';
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  Edit,
  Trash2,
  ImageIcon,
  FileText,
  Search
} from 'lucide-react';

interface EventAsset {
  name: string;
  url: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  location: string;
  assets: EventAsset[];
}


const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'milestone': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'event': return 'bg-green-100 text-green-800 border-green-200';
    case 'achievement': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case 'milestone': return <Calendar className="h-6 w-6 text-blue-500" />;
    case 'event': return <Clock className="h-6 w-6 text-green-500" />;
    case 'achievement': return <ImageIcon className="h-6 w-6 text-purple-500" />;
    default: return <Calendar className="h-6 w-6 text-gray-400" />;
  }
};


export function TimelinePage() {
  const [events, setEvents] = useUserData<TimelineEvent[]>('timeline_events', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    type: 'milestone',
    location: '',
    assets: [] as File[]
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  const sortedEvents = filteredEvents.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="relative min-h-screen pb-20">
      {/* Glassy Header */}
      <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl shadow-lg px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">Timeline</h1>
          <p className="mt-2 text-lg text-gray-600">Chronicle your life's journey through time</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({ title: '', description: '', date: '', type: 'milestone', location: '', assets: [] });
            setShowForm(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-5 py-2.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Event
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 animate-fade-in">
        <div className="glass-card flex items-center">
          <div className="p-3 bg-blue-100 rounded-xl shadow">
            <Calendar className="h-7 w-7 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Events</p>
            <p className="text-2xl font-extrabold text-gray-900">{events.length}</p>
          </div>
        </div>
        <div className="glass-card flex items-center">
          <div className="p-3 bg-green-100 rounded-xl shadow">
            <Clock className="h-7 w-7 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Years Covered</p>
            <p className="text-2xl font-extrabold text-gray-900">25</p>
          </div>
        </div>
        <div className="glass-card flex items-center">
          <div className="p-3 bg-purple-100 rounded-xl shadow">
            <MapPin className="h-7 w-7 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Locations</p>
            <p className="text-2xl font-extrabold text-gray-900">12</p>
          </div>
        </div>
        <div className="glass-card flex items-center">
          <div className="p-3 bg-orange-100 rounded-xl shadow">
            <ImageIcon className="h-7 w-7 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Assets</p>
            <p className="text-2xl font-extrabold text-gray-900">156</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-6 mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
            >
              <option value="all">All Types</option>
              <option value="milestone">Milestones</option>
              <option value="event">Events</option>
              <option value="achievement">Achievements</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card p-8 relative overflow-x-auto animate-fade-in">
        {/* Animated Timeline Line */}
        <div className="absolute left-12 top-8 bottom-8 w-1 bg-gradient-to-b from-blue-300 via-purple-200 to-pink-200 animate-pulse-timeline rounded-full z-0" style={{ minHeight: 'calc(100% - 4rem)' }}></div>

        <div className="space-y-12 relative z-10">
          {sortedEvents.map((event) => (
            <div key={event.id} className="relative flex items-start space-x-8 group">
              {/* Timeline Dot with Icon */}
              <div className="relative flex items-center justify-center w-24 h-24 bg-white/80 border-4 border-blue-200 shadow-lg rounded-full z-20 group-hover:scale-105 transition-transform">
                {getEventTypeIcon(event.type)}
                <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-semibold border ${getEventTypeColor(event.type)} shadow`}>{event.type}</span>
              </div>

              {/* Event Card */}
              <div className="flex-1 min-w-0">
                <div className="bg-gradient-to-br from-white/90 to-blue-50/80 rounded-2xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 drop-shadow-sm">{event.title}</h3>
                      </div>
                      <p className="text-gray-700 mb-4 text-lg">{event.description}</p>
                      <div className="flex items-center space-x-6 text-base text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-1 text-blue-400" />
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 mr-1 text-purple-400" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      {event.assets.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm text-gray-500">Assets:</span>
                          <div className="flex flex-wrap gap-2">
                            {event.assets.map((asset: EventAsset, assetIndex: number) => (
                              <a
                                key={assetIndex}
                                href={asset.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 shadow"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                {asset.name ?? asset}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2 ml-6">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white/70 transition-colors"
                        onClick={() => {
                          setEditingId(event.id);
                          setForm({
                            title: event.title,
                            description: event.description,
                            date: event.date,
                            type: event.type,
                            location: event.location,
                            assets: []
                          });
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white/70 transition-colors"
                        onClick={() => setEvents((prev) => prev.filter((ev) => ev.id !== event.id))}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Add Event Button */}
        <button
          onClick={() => {
            setEditingId(null);
            setForm({ title: '', description: '', date: '', type: 'milestone', location: '', assets: [] });
            setShowForm(true);
          }}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400 animate-bounce"
          title="Add Event"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      {/* Add/Edit Event Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              onClick={() => {
                setShowForm(false);
                setForm({ title: '', description: '', date: '', type: 'milestone', location: '', assets: [] });
              }}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900">{editingId ? 'Edit Event' : 'Add New Event'}</h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const uploaded = form.assets.map((f) => ({
                  name: f.name,
                  url: URL.createObjectURL(f),
                }));
                if (editingId) {
                  setEvents((prev) =>
                    prev.map((ev) =>
                      ev.id === editingId
                        ? { ...ev, ...form, assets: [...ev.assets, ...uploaded] }
                        : ev
                    )
                  );
                } else {
                  setEvents((prev) => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      ...form,
                      assets: uploaded,
                    },
                  ]);
                }
                setShowForm(false);
                setForm({ title: '', description: '', date: '', type: 'milestone', location: '', assets: [] });
              }}
            >
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="milestone">Milestone</option>
                <option value="event">Event</option>
                <option value="achievement">Achievement</option>
              </select>
              <div className="w-full">
                <FileUpload
                  multiple
                  onFilesSelected={(files) =>
                    setForm({ ...form, assets: Array.from(files) })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm({ title: '', description: '', date: '', type: 'milestone', location: '', assets: [] });
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                  {editingId ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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