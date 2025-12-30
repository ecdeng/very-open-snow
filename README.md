# ⛷️ Very Open Snow

A fast, minimal snow forecast and drive time planning app for North American ski resorts.

## Features

- 📊 **7-Day Forecast**: Hourly snow/rain forecasts in 12-hour windows
- 🚗 **Drive Planner**: Traffic-aware drive times from your location (Leave Now + Tomorrow Morning)
- ❤️ **Favorites**: Save your favorite resorts (localStorage)
- 🌍 **15 Major Resorts**: Handpicked resorts across US & Canada

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Weather**: Open-Meteo (free, no API key)
- **Routing**: Google Maps Routes API
- **Deployment**: Vercel

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Add your Google Maps API key:

```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Get a Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Routes API** (Directions API v2)
4. Create credentials → API Key
5. Copy the key to `.env.local`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Browse Resorts**: View all 15 resorts on the home page
2. **View Forecast**: Click a resort to see 7-day snow forecast
3. **Plan Drive**: Enable location and calculate drive times
4. **Save Favorites**: Click the heart icon to save resorts

## Resorts Included

- 🇺🇸 **US**: Palisades Tahoe, Vail, Park City, Jackson Hole, Alta, Mammoth, Aspen, Breckenridge, Steamboat, Taos
- 🇨🇦 **Canada**: Whistler Blackcomb, Lake Louise, Big White, Revelstoke, Sun Peaks

## API Routes

- `GET /api/forecast/[id]` - Get 7-day forecast for a resort
- `POST /api/drive` - Calculate drive times (body: `{origin, resortId, departureTimes}`)

## Deployment

### Deploy to Vercel

```bash
npm run build
npx vercel
```

Add `GOOGLE_MAPS_API_KEY` to your Vercel environment variables.

## Cost Estimates

- **Open-Meteo**: Free
- **Google Routes API**: ~$0.005 per request
  - 100 queries/day = ~$1/day = $30/month
  - Tip: Use the app yourself and share with friends to stay on free tier

## Future Enhancements

Phase 2 ideas:
- Resort-reported base depth (need data source)
- Weather alerts (winter storm warnings)
- Avalanche bulletin links
- More resorts (50+)
- Database for caching (reduce API costs)
- My Resorts dashboard page

## License

MIT - See LICENSE file

## Credits

- Weather data: [Open-Meteo](https://open-meteo.com/)
- Drive times: Google Maps Platform
