import { DateTime } from 'luxon';

export interface HourlyWeatherData {
  time: string[];
  temperature_2m: number[];
  snowfall: number[];
  rain: number[];
  windspeed_10m: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: HourlyWeatherData;
}

export interface ForecastWindow {
  windowStart: string;
  windowEnd: string;
  snowSum: number;    // inches
  rainSum: number;    // inches
  tempMin: number;    // fahrenheit
  tempMax: number;    // fahrenheit
  windMax: number;    // mph
}

/**
 * Fetch hourly weather forecast from Open-Meteo
 */
export async function getForecast(
  lat: number,
  lon: number
): Promise<OpenMeteoResponse> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lon.toString());
  url.searchParams.set('hourly', 'temperature_2m,snowfall,rain,windspeed_10m');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('windspeed_unit', 'mph');
  url.searchParams.set('precipitation_unit', 'inch');

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate 12-hour windows for the next 7 days in the resort's timezone
 */
export function generate12HourWindows(
  timezone: string,
  days: number = 7
): Array<{ start: DateTime; end: DateTime }> {
  const now = DateTime.now().setZone(timezone);
  const windows: Array<{ start: DateTime; end: DateTime }> = [];

  for (let day = 0; day < days; day++) {
    const date = now.plus({ days: day }).startOf('day');

    // AM window: 00:00 - 12:00
    windows.push({
      start: date,
      end: date.plus({ hours: 12 }),
    });

    // PM window: 12:00 - 24:00
    windows.push({
      start: date.plus({ hours: 12 }),
      end: date.plus({ hours: 24 }),
    });
  }

  return windows;
}

/**
 * Sum hourly data within a time window
 */
function sumHourlyData(
  times: string[],
  values: number[],
  windowStart: DateTime,
  windowEnd: DateTime
): number {
  let sum = 0;
  for (let i = 0; i < times.length; i++) {
    const time = DateTime.fromISO(times[i]);
    if (time >= windowStart && time < windowEnd) {
      sum += values[i] || 0;
    }
  }
  return sum;
}

/**
 * Find minimum value in a time window
 */
function minHourlyData(
  times: string[],
  values: number[],
  windowStart: DateTime,
  windowEnd: DateTime
): number {
  let min = Infinity;
  for (let i = 0; i < times.length; i++) {
    const time = DateTime.fromISO(times[i]);
    if (time >= windowStart && time < windowEnd) {
      min = Math.min(min, values[i] || Infinity);
    }
  }
  return min === Infinity ? 0 : min;
}

/**
 * Find maximum value in a time window
 */
function maxHourlyData(
  times: string[],
  values: number[],
  windowStart: DateTime,
  windowEnd: DateTime
): number {
  let max = -Infinity;
  for (let i = 0; i < times.length; i++) {
    const time = DateTime.fromISO(times[i]);
    if (time >= windowStart && time < windowEnd) {
      max = Math.max(max, values[i] || -Infinity);
    }
  }
  return max === -Infinity ? 0 : max;
}

/**
 * Get 12-hour forecast windows for a resort
 */
export async function get12HourForecast(
  lat: number,
  lon: number,
  timezone: string
): Promise<ForecastWindow[]> {
  const data = await getForecast(lat, lon);
  const windows = generate12HourWindows(timezone, 7);

  return windows.map((window) => ({
    windowStart: window.start.toISO()!,
    windowEnd: window.end.toISO()!,
    snowSum: Math.round(
      sumHourlyData(
        data.hourly.time,
        data.hourly.snowfall,
        window.start,
        window.end
      ) * 10
    ) / 10, // Round to 1 decimal
    rainSum: Math.round(
      sumHourlyData(
        data.hourly.time,
        data.hourly.rain,
        window.start,
        window.end
      ) * 10
    ) / 10,
    tempMin: Math.round(
      minHourlyData(
        data.hourly.time,
        data.hourly.temperature_2m,
        window.start,
        window.end
      )
    ),
    tempMax: Math.round(
      maxHourlyData(
        data.hourly.time,
        data.hourly.temperature_2m,
        window.start,
        window.end
      )
    ),
    windMax: Math.round(
      maxHourlyData(
        data.hourly.time,
        data.hourly.windspeed_10m,
        window.start,
        window.end
      )
    ),
  }));
}
