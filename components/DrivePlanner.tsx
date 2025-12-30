'use client';

import { useState } from 'react';
import { Resort } from '@/lib/resorts';
import { MapPin, Navigation, Clock, TrendingUp } from 'lucide-react';
import { DateTime } from 'luxon';
import { Card } from '@/components/ui/Card';

interface DrivePlannerProps {
  resort: Resort;
}

interface DriveResult {
  durationSeconds: number;
  staticDurationSeconds: number;
  distanceMeters: number;
  departureTime: string;
}

interface DriveResponse {
  resortId: string;
  resortName: string;
  routes: DriveResult[];
  fetchedAt: string;
}

export default function DrivePlanner({ resort }: DrivePlannerProps) {
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [mode, setMode] = useState<'now' | 'tomorrow'>('now');
  const [data, setData] = useState<DriveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setLocationError(`Error: ${error.message}`);
      }
    );
  };

  const getDepartureTimes = (): Date[] => {
    if (mode === 'now') {
      return [new Date()];
    } else {
      // Tomorrow morning at 6am, 7am, 8am, 9am in user's local timezone
      const tomorrow = DateTime.now().plus({ days: 1 }).startOf('day');
      return [6, 7, 8, 9].map((hour) =>
        tomorrow.plus({ hours: hour }).toJSDate()
      );
    }
  };

  const planDrive = async () => {
    if (!origin) {
      setError('Please enable location services first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const departureTimes = getDepartureTimes();

      const response = await fetch('/api/drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          resortId: resort.id,
          departureTimes: departureTimes.map((t) => t.toISOString()),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to compute drive times');
      }

      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
  };

  const formatDistance = (meters: number): string => {
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
  };

  const formatDepartureTime = (isoTime: string): string => {
    const dt = DateTime.fromISO(isoTime);
    return dt.toFormat('h:mm a');
  };

  const calculateDelay = (
    duration: number,
    staticDuration: number
  ): number => {
    return duration - staticDuration;
  };

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Your Location</h3>
        {!origin ? (
          <div>
            <button
              onClick={requestLocation}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              <Navigation className="w-5 h-5" />
              Enable Location
            </button>
            {locationError && (
              <p className="text-red-600 text-sm mt-3">{locationError}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Location enabled</span>
          </div>
        )}
      </div>

      {origin && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">When?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setMode('now')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  mode === 'now'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                Leave Now
              </button>
              <button
                onClick={() => setMode('tomorrow')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  mode === 'tomorrow'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                Tomorrow Morning
              </button>
            </div>
          </div>

          <button
            onClick={planDrive}
            disabled={loading}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loading ? 'Calculating...' : 'Plan My Drive'}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {data && data.routes && data.routes.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Drive Times</h3>
              <div className="space-y-3">
                {data.routes.map((route, idx) => {
                  const delay = calculateDelay(
                    route.durationSeconds,
                    route.staticDurationSeconds
                  );
                  const delayMinutes = Math.round(delay / 60);

                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-900">
                            {mode === 'now'
                              ? 'Now'
                              : formatDepartureTime(route.departureTime)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatDuration(route.durationSeconds)}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {formatDistance(route.distanceMeters)}
                          </div>
                        </div>
                      </div>

                      {delay > 60 && (
                        <div className="flex items-center gap-1 text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded-md w-fit">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-medium">+{delayMinutes} min traffic delay</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Updated {new Date(data.fetchedAt).toLocaleTimeString()} • Source: Google Maps
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
