'use client';

import { useState } from 'react';
import { Resort } from '@/lib/resorts';
import { MapPin, Navigation, Clock, TrendingUp } from 'lucide-react';
import { DateTime } from 'luxon';

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
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Your Location</h3>
        {!origin ? (
          <div>
            <button
              onClick={requestLocation}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Enable Location
            </button>
            {locationError && (
              <p className="text-red-500 text-sm mt-2">{locationError}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <MapPin className="w-4 h-4" />
            Location enabled ({origin.lat.toFixed(4)}, {origin.lng.toFixed(4)})
          </div>
        )}
      </div>

      {origin && (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">When?</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('now')}
                className={`px-4 py-2 rounded transition-colors ${
                  mode === 'now'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Leave Now
              </button>
              <button
                onClick={() => setMode('tomorrow')}
                className={`px-4 py-2 rounded transition-colors ${
                  mode === 'tomorrow'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tomorrow Morning
              </button>
            </div>
          </div>

          <button
            onClick={planDrive}
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-3 rounded font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : 'Plan My Drive'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {data && data.routes && data.routes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Drive Times</h3>
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
                      className="border rounded p-3 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold">
                            {mode === 'now'
                              ? 'Now'
                              : formatDepartureTime(route.departureTime)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatDuration(route.durationSeconds)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistance(route.distanceMeters)}
                          </div>
                        </div>
                      </div>

                      {delay > 60 && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <TrendingUp className="w-3 h-3" />
                          +{delayMinutes} min traffic delay
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Updated {new Date(data.fetchedAt).toLocaleTimeString()} • Source: Google Maps
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
