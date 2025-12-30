export interface Resort {
  id: string;
  name: string;
  slug: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  tz: string;
  elevation: number; // feet
}

export const RESORTS: Resort[] = [
  // West to East - Ikon Pass Resorts in North America
  {
    id: 'palisades-tahoe',
    name: 'Palisades Tahoe',
    slug: 'palisades-tahoe',
    country: 'US',
    region: 'California',
    lat: 39.1978,
    lon: -120.2357,
    tz: 'America/Los_Angeles',
    elevation: 9045,
  },
  {
    id: 'mammoth-mountain',
    name: 'Mammoth Mountain',
    slug: 'mammoth-mountain',
    country: 'US',
    region: 'California',
    lat: 37.6308,
    lon: -119.0326,
    tz: 'America/Los_Angeles',
    elevation: 11053,
  },
  {
    id: 'big-sky',
    name: 'Big Sky Resort',
    slug: 'big-sky',
    country: 'US',
    region: 'Montana',
    lat: 45.2849,
    lon: -111.4083,
    tz: 'America/Denver',
    elevation: 11166,
  },
  {
    id: 'jackson-hole',
    name: 'Jackson Hole',
    slug: 'jackson-hole',
    country: 'US',
    region: 'Wyoming',
    lat: 43.5872,
    lon: -110.8278,
    tz: 'America/Denver',
    elevation: 10449,
  },
  {
    id: 'alta',
    name: 'Alta',
    slug: 'alta',
    country: 'US',
    region: 'Utah',
    lat: 40.5885,
    lon: -111.6387,
    tz: 'America/Denver',
    elevation: 10548,
  },
  {
    id: 'snowbird',
    name: 'Snowbird',
    slug: 'snowbird',
    country: 'US',
    region: 'Utah',
    lat: 40.5832,
    lon: -111.6573,
    tz: 'America/Denver',
    elevation: 11000,
  },
  {
    id: 'deer-valley',
    name: 'Deer Valley',
    slug: 'deer-valley',
    country: 'US',
    region: 'Utah',
    lat: 40.6374,
    lon: -111.4783,
    tz: 'America/Denver',
    elevation: 9570,
  },
  {
    id: 'solitude',
    name: 'Solitude Mountain Resort',
    slug: 'solitude',
    country: 'US',
    region: 'Utah',
    lat: 40.6199,
    lon: -111.5919,
    tz: 'America/Denver',
    elevation: 10035,
  },
  {
    id: 'aspen-snowmass',
    name: 'Aspen Snowmass',
    slug: 'aspen-snowmass',
    country: 'US',
    region: 'Colorado',
    lat: 39.2130,
    lon: -106.9479,
    tz: 'America/Denver',
    elevation: 12510,
  },
  {
    id: 'steamboat',
    name: 'Steamboat',
    slug: 'steamboat',
    country: 'US',
    region: 'Colorado',
    lat: 40.4572,
    lon: -106.8047,
    tz: 'America/Denver',
    elevation: 10568,
  },
  {
    id: 'winter-park',
    name: 'Winter Park Resort',
    slug: 'winter-park',
    country: 'US',
    region: 'Colorado',
    lat: 39.8868,
    lon: -105.7625,
    tz: 'America/Denver',
    elevation: 10800,
  },
  {
    id: 'copper-mountain',
    name: 'Copper Mountain',
    slug: 'copper-mountain',
    country: 'US',
    region: 'Colorado',
    lat: 39.5021,
    lon: -106.1506,
    tz: 'America/Denver',
    elevation: 12313,
  },
  {
    id: 'eldora',
    name: 'Eldora Mountain Resort',
    slug: 'eldora',
    country: 'US',
    region: 'Colorado',
    lat: 39.9372,
    lon: -105.5828,
    tz: 'America/Denver',
    elevation: 10800,
  },
  {
    id: 'taos',
    name: 'Taos Ski Valley',
    slug: 'taos',
    country: 'US',
    region: 'New Mexico',
    lat: 36.5928,
    lon: -105.4467,
    tz: 'America/Denver',
    elevation: 12480,
  },
  {
    id: 'stratton',
    name: 'Stratton Mountain',
    slug: 'stratton',
    country: 'US',
    region: 'Vermont',
    lat: 43.1136,
    lon: -72.9083,
    tz: 'America/New_York',
    elevation: 3875,
  },
];

export function getResortBySlug(slug: string): Resort | undefined {
  return RESORTS.find((r) => r.slug === slug);
}

export function getResortById(id: string): Resort | undefined {
  return RESORTS.find((r) => r.id === id);
}
