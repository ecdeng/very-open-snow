import { NextRequest, NextResponse } from 'next/server';
import { getResortById } from '@/lib/resorts';
import { computeMultipleRoutes, Coordinates } from '@/lib/routes';

export interface DriveRequest {
  origin: Coordinates;
  resortId: string;
  departureTimes: string[]; // ISO date strings
}

export async function POST(request: NextRequest) {
  try {
    const body: DriveRequest = await request.json();
    const { origin, resortId, departureTimes } = body;

    // Validate input
    if (!origin || !resortId || !departureTimes || departureTimes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, resortId, departureTimes' },
        { status: 400 }
      );
    }

    // Limit number of departure times to prevent abuse
    if (departureTimes.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 departure times allowed' },
        { status: 400 }
      );
    }

    const resort = getResortById(resortId);

    if (!resort) {
      return NextResponse.json(
        { error: 'Resort not found' },
        { status: 404 }
      );
    }

    const destination: Coordinates = {
      lat: resort.lat,
      lng: resort.lon,
    };

    const times = departureTimes.map((t) => new Date(t));
    const routes = await computeMultipleRoutes(origin, destination, times);

    return NextResponse.json({
      resortId: resort.id,
      resortName: resort.name,
      origin,
      destination,
      routes,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error computing drive times:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to compute drive times',
      },
      { status: 500 }
    );
  }
}
