'use client';

import { useState, useEffect } from 'react';
import { Resort } from '@/lib/resorts';
import { ForecastWindow } from '@/lib/weather';
import { Snowflake, CloudRain, Wind, Thermometer, Loader2 } from 'lucide-react';
import { DateTime } from 'luxon';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/Card';

interface ForecastGridProps {
  resort: Resort;
}

interface ForecastResponse {
  resortId: string;
  resortName: string;
  forecast: ForecastWindow[];
  fetchedAt: string;
  source: string;
}

export default function ForecastGrid({ resort }: ForecastGridProps) {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForecast() {
      try {
        setLoading(true);
        const response = await fetch(`/api/forecast/${resort.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch forecast');
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchForecast();
  }, [resort.id]);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <p className="text-gray-600">Loading forecast...</p>
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error: {error || 'Failed to load forecast'}</p>
          <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  const formatWindow = (windowStart: string): string => {
    const dt = DateTime.fromISO(windowStart).setZone(resort.tz);
    const hour = dt.hour;
    const period = hour === 0 ? 'AM' : 'PM';
    return `${dt.toFormat('EEE, MMM d')} ${period}`;
  };

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Updated</span> {formatDistanceToNow(new Date(data.fetchedAt))} ago
          </p>
          <p className="text-xs text-gray-600">
            Source: {data.source}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Time Window
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 hidden sm:table-cell">
                <div className="flex items-center justify-center gap-2">
                  <Snowflake className="w-4 h-4 text-blue-500" />
                  <span>Snow</span>
                </div>
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 hidden md:table-cell">
                <div className="flex items-center justify-center gap-2">
                  <CloudRain className="w-4 h-4 text-gray-500" />
                  <span>Rain</span>
                </div>
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">
                <div className="flex items-center justify-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span className="hidden sm:inline">Temp</span>
                  <span className="sm:hidden">°F</span>
                </div>
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 hidden lg:table-cell">
                <div className="flex items-center justify-center gap-2">
                  <Wind className="w-4 h-4 text-gray-500" />
                  <span>Wind</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.forecast.map((window, idx) => (
              <tr
                key={idx}
                className={`hover:bg-gray-50 transition-colors ${
                  window.snowSum > 4 ? 'bg-blue-50/50' : ''
                }`}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {formatWindow(window.windowStart)}
                </td>
                <td className={`px-4 py-4 text-center text-base font-semibold hidden sm:table-cell ${
                    window.snowSum > 0 ? 'text-blue-600' : 'text-gray-300'
                  }`}
                >
                  {window.snowSum > 0 ? `${window.snowSum.toFixed(1)}"` : '—'}
                </td>
                <td className={`px-4 py-4 text-center text-sm hidden md:table-cell ${
                    window.rainSum > 0 ? 'text-gray-700' : 'text-gray-300'
                  }`}
                >
                  {window.rainSum > 0 ? `${window.rainSum.toFixed(1)}"` : '—'}
                </td>
                <td className="px-4 py-4 text-center text-sm text-gray-700">
                  <span className="font-medium">{window.tempMin}°</span>
                  <span className="text-gray-400 mx-1">-</span>
                  <span className="font-medium">{window.tempMax}°</span>
                </td>
                <td className="px-4 py-4 text-center text-sm text-gray-600 hidden lg:table-cell">
                  {window.windMax} mph
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Note */}
      <div className="sm:hidden bg-gray-50 px-4 py-3 text-xs text-gray-500 text-center border-t">
        Scroll horizontally or rotate device for full details
      </div>
    </Card>
  );
}
