import { NextRequest, NextResponse } from 'next/server';
import { getResortById } from '@/lib/resorts';
import { get12HourForecast } from '@/lib/weather';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resort = getResortById(id);

    if (!resort) {
      return NextResponse.json(
        { error: 'Resort not found' },
        { status: 404 }
      );
    }

    const forecast = await get12HourForecast(
      resort.lat,
      resort.lon,
      resort.tz
    );

    return NextResponse.json({
      resortId: resort.id,
      resortName: resort.name,
      forecast,
      fetchedAt: new Date().toISOString(),
      source: 'Open-Meteo',
    });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forecast' },
      { status: 500 }
    );
  }
}
