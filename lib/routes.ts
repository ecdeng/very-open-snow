export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteRequest {
  origin: Coordinates;
  destination: Coordinates;
  departureTime: Date;
}

export interface RouteResult {
  durationSeconds: number;
  staticDurationSeconds: number;
  distanceMeters: number;
  departureTime: string;
}

/**
 * Compute a route using Google Routes API (Directions v2)
 *
 * IMPORTANT: departureTime must be in the future for traffic-aware routing
 * We automatically add a 2-minute buffer if needed
 */
export async function computeRoute(
  req: RouteRequest
): Promise<RouteResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  }

  // Ensure departureTime is in the future (minimum 2 minutes ahead)
  const now = new Date();
  let departureTime = new Date(req.departureTime);

  if (departureTime <= now) {
    departureTime = new Date(now.getTime() + 120000); // +2 minutes
  }

  try {
    const response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.duration,routes.staticDuration,routes.distanceMeters',
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: req.origin.lat,
                longitude: req.origin.lng,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: req.destination.lat,
                longitude: req.destination.lng,
              },
            },
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
          departureTime: departureTime.toISOString(),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Retry with larger buffer if timestamp error
      if (
        response.status === 400 &&
        JSON.stringify(errorData).includes('future time')
      ) {
        const retryTime = new Date(now.getTime() + 300000); // +5 minutes
        return computeRoute({
          ...req,
          departureTime: retryTime,
        });
      }

      throw new Error(
        `Google Routes API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }

    const route = data.routes[0];

    // Parse duration strings (format: "123s")
    const durationSeconds = parseInt(route.duration.replace('s', ''));
    const staticDurationSeconds = parseInt(
      route.staticDuration.replace('s', '')
    );

    return {
      durationSeconds,
      staticDurationSeconds,
      distanceMeters: route.distanceMeters,
      departureTime: departureTime.toISOString(),
    };
  } catch (error) {
    console.error('Error computing route:', error);
    throw error;
  }
}

/**
 * Compute routes for multiple departure times
 */
export async function computeMultipleRoutes(
  origin: Coordinates,
  destination: Coordinates,
  departureTimes: Date[]
): Promise<RouteResult[]> {
  // Execute requests sequentially to avoid rate limits
  // In production, you might want to add batching or parallel requests with limits
  const results: RouteResult[] = [];

  for (const departureTime of departureTimes) {
    const result = await computeRoute({
      origin,
      destination,
      departureTime,
    });
    results.push(result);
  }

  return results;
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Format distance in meters to human-readable string
 */
export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;

  if (miles < 0.1) {
    const feet = Math.round(meters * 3.28084);
    return `${feet} ft`;
  }

  return `${miles.toFixed(1)} mi`;
}

/**
 * Calculate traffic delay
 */
export function calculateDelay(
  durationSeconds: number,
  staticDurationSeconds: number
): number {
  return durationSeconds - staticDurationSeconds;
}
