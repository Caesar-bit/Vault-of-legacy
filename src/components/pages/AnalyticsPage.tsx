import React, { useEffect, useState } from 'react';
import { AnimatedAlert } from '../AnimatedAlert';
import {
  TrendingDown,
  Eye,
  Users,
  Clock,
  Download,
  Share2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    avgSessionDuration: string;
    bounceRate: string;
    trends: {
      views: number;
      visitors: number;
      duration: number;
      bounce: number;
    };
  };
  timeSeriesData: { date: string; views: number; visitors: number; sessions: number }[];
  deviceData: { name: string; value: number; color: string }[];
  topContent: { title: string; views: number; engagement: string; type: string }[];
  geographicData: { country: string; visitors: number; percentage: number }[];
}


const getDaysForRange = (range: string) => {
  switch (range) {
    case '30d':
      return 30;
    case '90d':
      return 90;
    case '1y':
      return 365;
    default:
      return 7;
  }
};

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateAnalyticsData = (days: number): AnalyticsData => {
  const timeSeriesData = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    return {
      date: date.toISOString().slice(0, 10),
      views: randomInt(50, 150),
      visitors: randomInt(20, 120),
      sessions: randomInt(15, 100),
    };
  });

  const totals = timeSeriesData.reduce(
    (acc, d) => {
      acc.views += d.views;
      acc.visitors += d.visitors;
      return acc;
    },
    { views: 0, visitors: 0 }
  );

  const avgSessionSeconds = randomInt(60, 600);
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const deviceRaw = [Math.random(), Math.random(), Math.random()];
  const deviceTotal = deviceRaw.reduce((a, b) => a + b, 0);
  const [desktopRaw, mobileRaw, tabletRaw] = deviceRaw;
  const desktopPct = Math.round((desktopRaw / deviceTotal) * 100);
  const mobilePct = Math.round((mobileRaw / deviceTotal) * 100);
  let tabletPct = Math.round((tabletRaw / deviceTotal) * 100);
  const diff = 100 - (desktopPct + mobilePct + tabletPct);
  tabletPct += diff;
  const deviceData = [
    { name: 'Desktop', value: desktopPct, color: '#3B82F6' },
    { name: 'Mobile', value: mobilePct, color: '#10B981' },
    { name: 'Tablet', value: tabletPct, color: '#F59E0B' },
  ];

  const sampleTitles = [
    'Getting Started Guide',
    'Advanced Security Tips',
    'Managing Collections',
    'Exporting Your Data',
    'Mobile App Overview',
  ];
  const topContent = sampleTitles.slice(0, 4).map((title) => ({
    title,
    views: randomInt(200, 2000),
    engagement: `${randomInt(40, 90)}%`,
    type: ['article', 'video', 'guide'][randomInt(0, 2)],
  }));

  const countries = ['United States', 'Germany', 'Brazil', 'Japan', 'India'];
  const geographicData = countries.map((c) => ({
    country: c,
    visitors: randomInt(50, 500),
    percentage: randomInt(5, 40),
  }));

  return {
    overview: {
      totalViews: totals.views,
      uniqueVisitors: totals.visitors,
      avgSessionDuration: formatDuration(avgSessionSeconds),
      bounceRate: `${randomInt(20, 70)}%`,
      trends: {
        views: randomInt(-10, 10),
        visitors: randomInt(-10, 10),
        duration: randomInt(-5, 5),
        bounce: randomInt(-5, 5),
      },
    },
    timeSeriesData,
    deviceData,
    topContent,
    geographicData,
  };
};

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('views');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(() => {
    const stored = localStorage.getItem('analytics-7d');
    return stored ? JSON.parse(stored) : generateAnalyticsData(7);
  });
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const key = `analytics-${dateRange}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setAnalyticsData(JSON.parse(stored));
    } else {
      const data = generateAnalyticsData(getDaysForRange(dateRange));
      setAnalyticsData(data);
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, [dateRange]);

  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 3000);
    return () => clearTimeout(t);
  }, [alert]);

  const handleRefresh = () => {
    const data = generateAnalyticsData(getDaysForRange(dateRange));
    setAnalyticsData(data);
    localStorage.setItem(`analytics-${dateRange}`, JSON.stringify(data));
  };

  const handleExport = () => {
    const header = 'date,views,visitors,sessions\n';
    const rows = analyticsData.timeSeriesData
      .map((d) => `${d.date},${d.views},${d.visitors},${d.sessions}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const text = `Total views: ${analyticsData.overview.totalViews}, unique visitors: ${analyticsData.overview.uniqueVisitors}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Analytics Summary', text });
      } catch {
        // ignore cancel
      }
    } else {
      await navigator.clipboard.writeText(text);
      setAlert({ message: 'Summary copied to clipboard', type: 'success' });
    }
  };

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
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
      </div>

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
  );
}