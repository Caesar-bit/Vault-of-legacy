import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  Clock, 
  Download, 
  Share2,
  Calendar,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchAnalytics } from '../../utils/api';

const mockAnalyticsData = {
  overview: {
    totalViews: 45672,
    uniqueVisitors: 12847,
    avgSessionDuration: '4:32',
    bounceRate: '32.5%',
    trends: {
      views: 18.2,
      visitors: 12.5,
      duration: -5.3,
      bounce: -8.1
    }
  },
  timeSeriesData: [
    { date: '2024-01-01', views: 1200, visitors: 450, sessions: 380 },
    { date: '2024-01-02', views: 1350, visitors: 520, sessions: 420 },
    { date: '2024-01-03', views: 1100, visitors: 380, sessions: 340 },
    { date: '2024-01-04', views: 1450, visitors: 580, sessions: 480 },
    { date: '2024-01-05', views: 1600, visitors: 620, sessions: 520 },
    { date: '2024-01-06', views: 1300, visitors: 490, sessions: 410 },
    { date: '2024-01-07', views: 1750, visitors: 680, sessions: 580 }
  ],
  deviceData: [
    { name: 'Desktop', value: 45, color: '#3B82F6' },
    { name: 'Mobile', value: 35, color: '#10B981' },
    { name: 'Tablet', value: 20, color: '#F59E0B' }
  ],
  topContent: [
    { title: 'Family Heritage Collection', views: 2847, engagement: '85%', type: 'collection' },
    { title: 'Wedding Day Memories', views: 2156, engagement: '78%', type: 'gallery' },
    { title: 'Timeline: Three Generations', views: 1923, engagement: '82%', type: 'timeline' },
    { title: 'WWII Documents Archive', views: 1654, engagement: '71%', type: 'archive' },
    { title: 'Childhood Adventures', views: 1432, engagement: '76%', type: 'gallery' }
  ],
  geographicData: [
    { country: 'United States', visitors: 5847, percentage: 45.5 },
    { country: 'Canada', visitors: 1923, percentage: 15.0 },
    { country: 'United Kingdom', visitors: 1456, percentage: 11.3 },
    { country: 'Australia', visitors: 987, percentage: 7.7 },
    { country: 'Germany', visitors: 654, percentage: 5.1 }
  ]
};

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('views');
  const [analyticsData, setAnalyticsData] = useState(mockAnalyticsData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('vault_jwt') || '';
        if (token) {
          const data = await fetchAnalytics(token);
          setAnalyticsData(data);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'Desktop': return Monitor;
      case 'Mobile': return Smartphone;
      case 'Tablet': return Tablet;
      default: return Monitor;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Track engagement, performance, and user behavior</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="p-6 text-red-500">{error}</div>
      ) : (

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalViews)}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {analyticsData.overview.trends.views > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm font-medium ${analyticsData.overview.trends.views > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(analyticsData.overview.trends.views)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.uniqueVisitors)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-600">
              {analyticsData.overview.trends.visitors}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Session Duration</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.avgSessionDuration}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
            <span className="text-sm font-medium text-red-600">
              {Math.abs(analyticsData.overview.trends.duration)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.bounceRate}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowDownRight className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-600">
              {Math.abs(analyticsData.overview.trends.bounce)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">improvement</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trends */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Traffic Trends</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="views">Views</option>
              <option value="visitors">Visitors</option>
              <option value="sessions">Sessions</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Device Breakdown</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {analyticsData.deviceData.map((device) => {
              const DeviceIcon = getDeviceIcon(device.name);
              return (
                <div key={device.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DeviceIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{device.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{device.value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Performance and Geographic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Content */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Content</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {analyticsData.topContent.map((content, index) => (
              <div key={content.title} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{content.title}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{formatNumber(content.views)} views</span>
                      <span>{content.engagement} engagement</span>
                      <span className="capitalize">{content.type}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Data */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {analyticsData.geographicData.map((location) => (
              <div key={location.country} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{location.country}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{formatNumber(location.visitors)}</div>
                    <div className="text-sm text-gray-500">{location.percentage}%</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">23</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">156</div>
            <div className="text-sm text-gray-600">Page Views (last hour)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">4.2</div>
            <div className="text-sm text-gray-600">Avg Pages/Session</div>
          </div>
        </div>
      </div>
    </div>
    )}
  );
}