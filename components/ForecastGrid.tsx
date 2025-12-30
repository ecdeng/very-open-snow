'use client';

import { useState, useEffect } from 'react';
import { Resort } from '@/lib/resorts';
import { ForecastWindow } from '@/lib/weather';
import { Snowflake, CloudRain, Wind, Thermometer } from 'lucide-react';
import { DateTime } from 'luxon';
import { formatDistanceToNow } from 'date-fns';

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
      <div className="border rounded-lg p-8 text-center">
        <p className="text-gray-500">Loading forecast...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-red-500">Error: {error || 'Failed to load forecast'}</p>
      </div>
    );
  }

  const formatWindow = (windowStart: string): string => {
    const dt = DateTime.fromISO(windowStart).setZone(resort.tz);
    const hour = dt.hour;
    const period = hour === 0 ? 'AM (Midnight-Noon)' : 'PM (Noon-Midnight)';
    return `${dt.toFormat('EEE, MMM d')} ${period}`;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-3 border-b text-sm text-gray-600">
        Updated {formatDistanceToNow(new Date(data.fetchedAt))} ago • Source: {data.source}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Time Window</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Snowflake className="w-4 h-4" />
                  Snow (in)
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <CloudRain className="w-4 h-4" />
                  Rain (in)
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Thermometer className="w-4 h-4" />
                  Temp (°F)
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Wind className="w-4 h-4" />
                  Wind (mph)
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.forecast.map((window, idx) => (
              <tr
                key={idx}
                className={`border-b hover:bg-gray-50 ${
                  window.snowSum > 2 ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium">
                  {formatWindow(window.windowStart)}
                </td>
                <td
                  className={`px-4 py-3 text-center text-sm font-semibold ${
                    window.snowSum > 0 ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {window.snowSum > 0 ? window.snowSum.toFixed(1) : '—'}
                </td>
                <td
                  className={`px-4 py-3 text-center text-sm ${
                    window.rainSum > 0 ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {window.rainSum > 0 ? window.rainSum.toFixed(1) : '—'}
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  {window.tempMin}° to {window.tempMax}°
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">
                  {window.windMax}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
