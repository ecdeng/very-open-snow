# very-open-snow — MVP PRD / Design Doc

**Owner:** You  
**Audience:** Engineering (Codex), Product, Design  
**Status:** Draft for MVP build  
**North Star:** A fast, trustworthy snow + forecast dashboard for *all North American ski resorts*, plus a “Plan my drive” feature.

---

## 1) Summary

Build a self-hosted web app similar to a simplified OpenSnow that supports basic resort conditions and forecasts across North America and adds a unique **Plan my drive** feature. The MVP prioritizes:
- **Coverage:** all NA resorts in a single catalog
- **Utility:** base depth, 48h precip (snow vs rain), 7‑day forecast in 12‑hour windows
- **Stickiness:** favorites + My Resorts dashboard
- **Trust:** freshness timestamps + source transparency
- **Safety awareness:** basic weather alerts + avalanche bulletin links (when available)

---

## 2) Goals & Non‑Goals

### Goals
1. **Resort coverage:** searchable/browsable directory for all NA ski resorts.
2. **Conditions:** show *current base depth* (resort‑reported when available).
3. **Recent precip:** show total precip in last 48 hours split into **snow vs rain**.
4. **Forecast:** show the next 7 days in **12‑hour windows** with snow/rain totals and key weather metrics.
5. **Drive planning:** from current browser location, show predicted drive times:
   - **Leave now:** traffic‑aware duration now
   - **Plan for tomorrow:** traffic‑aware predicted duration for multiple morning departure times
6. **Favorites:** allow users to favorite resorts and view a “My Resorts” dashboard.
7. **Freshness + sources:** show “Updated X ago • Source: …” on all condition/forecast/alerts widgets.
8. **Alerts overlay:** show active weather alerts (winter storm, high wind, etc.) + avalanche bulletin links where available.

### Non‑Goals (MVP)
- Deep meteorology features (radar layers, custom downscaling, long‑range seasonal models)
- User accounts / cross-device sync (unless trivial to add later)
- Push notifications
- Full historical time-series analytics beyond the 48h view
- Advanced maps beyond basic resort location display (optional later)

---

## 3) Users & Use Cases

### Primary user persona
- **Weekend skier/rider**: wants quick conditions + forecast + drive plan to decide where/when to go.

### Core use cases
1. “What’s the base depth and how much snow fell in the last 48h at my favorite resorts?”
2. “Show me the next 7 days forecast for this resort in a simple grid.”
3. “From where I am, which resorts are closest *right now*?”
4. “If I leave tomorrow at 6/7/8/9 AM, how long is the drive likely to take?”
5. “Are there storms/wind warnings or avalanche bulletins I should know about?”

---

## 4) MVP Product Requirements

### 4.1 Resort Directory
**Requirements**
- Must contain *all* NA ski resorts with:
  - `id`, `name`, `slug`, `country`, `region/state/province` (if available)
  - `lat`, `lon`
  - `timezone` (needed for forecast windows and “tomorrow morning”)
- Search:
  - typeahead by name
  - optional filters (country, region)
- Resort detail page accessible by stable URL: `/resorts/{slug}`.

**Success criteria**
- Resort lookup works for common NA resorts and long-tail resorts.

---

### 4.2 Current Base Depth
**Definition**
- “Base depth” as reported by resort/partner (not model).

**UI**
- Display value + units (in/cm).
- Display: `Updated X ago • Source: Resort report` (or equivalent).
- If missing: show “Not reported” and optionally a secondary “Modeled snow depth” line (clearly labeled as model).

**Data**
- Store both:
  - `observed_at` (when the report says it’s valid)
  - `fetched_at` (when our system pulled it)

**Edge cases**
- Resorts report inconsistently; we must always label source and time.

---

### 4.3 Last 48 Hours Precip Split (Snow vs Rain)
**Definition**
- Total precipitation in last 48 hours at resort coordinates, split:
  - `snow_48h` (e.g., inches/cm of snowfall)
  - `rain_48h` (e.g., inches/mm of rainfall)

**UI**
- Two numbers (snow, rain) with the same freshness format:
  - `Updated X ago • Source: Weather model`
- Small disclaimer: “Estimated at resort coordinates.”

**Computation**
- Use hourly model/forecast data to sum last 48 hours.

---

### 4.4 7‑Day Forecast in 12‑Hour Windows
**Definition**
- Forecast presented in 12‑hour windows for the next 7 days (14 windows).
- Windows aligned to **local resort time**:
  - `00:00–12:00` and `12:00–24:00`

**Per window fields (MVP)**
- `snow_sum`
- `rain_sum`
- `temp_min`
- `temp_max`
- `wind_max` (optional but useful)

**UI**
- Table/grid with 14 rows:
  - Date + AM/PM label
  - Snow, rain, temp range, wind (optional)
- Freshness: `Updated X ago • Source: Weather model`

---

### 4.5 Plan My Drive (Unique Feature)
**Definition**
- Uses browser geolocation to compute predicted drive time to selected resorts.

**Modes**
1. **Leave now**
   - Traffic-aware duration for current time.
2. **Plan for tomorrow**
   - Predicted drive time for multiple departure times in the morning.
   - Default times: `06:00, 07:00, 08:00, 09:00` local time.

**UX**
- Entry points:
  - Button on each Resort page
  - Dedicated “Drive Planner” page
  - My Resorts dashboard widget
- Location:
  - Request browser geolocation permission.
  - Provide manual origin override (address input) if permission denied.

**Timezone choice (MVP)**
- Departure times for “tomorrow” are interpreted in **user’s local timezone** (browser), since the user is deciding when to leave.
- Display arrival/resort timezone if different (small label).

**API behavior**
- Input: origin lat/lon (or address), list of resort IDs, mode, departure times
- Output: drive durations + distance + provider

**Cost controls**
- Aggressive caching:
  - Leave now: cache 10–20 minutes
  - Tomorrow: cache 3–6 hours
- Limit maximum resorts per request (e.g., 25).

**Privacy**
- Do not store precise user location persistently.
- If caching, bucket origin using geohash rounding (e.g., 5–6 chars) to avoid exact location retention.


#### Google Routes API notes (implementation detail)
- Use **Google Maps Platform Routes API** (`directions/v2:computeRoutes`) for traffic-aware drive times.
- Routes API requires a **future** `departureTime`. For “Leave now”, set `departureTime = now + buffer` (recommended **+120s**; increase to **+300s** if you see occasional `Timestamp must be set to a future time` errors).
- Add a simple retry: if the API returns `INVALID_ARGUMENT` about the timestamp, retry once with a larger buffer.
- Request both:
  - `routes.duration` (traffic-aware when using `routingPreference=TRAFFIC_AWARE(_OPTIMAL)`)
  - `routes.staticDuration` (baseline/no-traffic)
- **Field mask is required** via `X-Goog-FieldMask` to limit returned fields and avoid errors.
- Since we expect only a few resorts per area, MVP can call `computeRoutes` **once per resort** (loop destinations). If/when we need batching, consider `computeRouteMatrix`.


---

### 4.6 Favorites + “My Resorts” Dashboard
**MVP approach**
- No-login: store favorites in `localStorage`.
- Optional: export/import favorites JSON.

**My Resorts UI**
- Compact cards for favorited resorts showing:
  - Base depth
  - 48h snow vs rain
  - Next 36h preview (3× 12h windows)
  - Alert badges (weather + avalanche)
  - “Plan my drive” quick action

**Performance**
- My Resorts should load in ≤ 2 seconds on broadband by fetching a single aggregated API response if possible.

---

### 4.7 Data Freshness + Source Transparency
**Global requirement**
- Every widget that shows computed or reported data must show:
  - `Updated X ago` (based on `fetched_at`)
  - `Source: ...` (Resort report / Weather model / Alerts feed / Avalanche bulletin)

**Tooltip**
- Show exact timestamps for:
  - `observed_at` (if applicable)
  - `fetched_at`

**Staleness**
- If data exceeds a threshold:
  - Show subtle “stale” indicator (e.g., `Updated 18h ago`)
- Suggested thresholds:
  - Base depth: 12h (soft warn), 24h (warn)
  - Forecast: 6h (soft warn), 12h (warn)
  - Alerts: 30m (soft warn), 2h (warn)

---

### 4.8 Weather Alerts Overlay + Avalanche Bulletin Links
**Weather alerts (MVP)**
- Show active alerts relevant to resort coordinates:
  - winter storm warnings
  - high wind warnings/advisories
  - blizzard warnings, etc.

**Avalanche (MVP)**
- Provide *links* to the appropriate avalanche forecast/bulletin for the resort’s area when available.
- If an area match is not available, show a generic “Find avalanche forecast” link for the region.

**UI**
- On Resort page + My Resorts cards:
  - Badges: `Winter Storm Warning`, `High Wind`, `Avalanche Bulletin`
- Clicking opens a panel with:
  - headline/title, severity, effective window
  - short summary (truncated)
  - “View full alert/bulletin” link to source

**Freshness**
- Alerts panel also shows `Updated X ago • Source: Alerts feed` or `Avalanche bulletin`.

---

## 5) Data Sources (MVP Assumptions)

> Exact vendor selection can be swapped without changing the UI contracts if we keep internal normalized schemas.

- **Resort catalog (all NA resorts):** OSM-derived dataset or curated resort list; store coordinates + timezone.
- **Base depth (resort-reported):** prefer a partner snow report API for broad coverage; otherwise partial coverage + “Not reported”.
- **Weather model data:** needs hourly rain + snowfall, temperature, wind; used for 48h aggregates and 12h forecast windows.
- **Weather alerts:** US/Canada official feeds by location.
- **Avalanche links:** map resort -> avalanche forecast area when possible; otherwise regional fallback links.

---

## 6) System Architecture (MVP)

### High-level
- **Frontend:** Next.js (SSR for resort pages; client-side for dashboard widgets)
- **Backend API:** FastAPI or Node/Express (REST)
- **Database:** Postgres + PostGIS (resorts, cached aggregates, alerts, optional favorites)
- **Cache:** Redis (API response caching, rate limiting)
- **Jobs/Workers:** background worker for periodic refresh (cron + worker queue)

### Services (logical modules)
1. **Resort Catalog Service** — ingest/update resort list
2. **Conditions Service** — fetch base depth
3. **Weather Service** — fetch hourly rain/snow + temp/wind; compute aggregates + 12h windows
4. **Alerts Service** — fetch active weather alerts; maintain avalanche mapping/links
5. **Drive Time Service** — compute traffic-aware routes for now/tomorrow

---

## 7) Data Model (Minimum)

### Tables

**resorts**
- `id` (uuid, pk)
- `name` (text)
- `slug` (text, unique)
- `country` (text: US/CA/MX)
- `region` (text)
- `lat` (float), `lon` (float)
- `tz` (text, IANA timezone)
- `created_at`, `updated_at`

**resort_conditions_latest**
- `resort_id` (fk)
- `base_depth` (float, nullable)
- `units` (text: in/cm)
- `observed_at` (timestamptz, nullable)
- `fetched_at` (timestamptz)
- `source` (text: resort_report|partner_api|unknown)
- `raw_payload` (jsonb, optional)

**resort_weather_aggregates**
- `resort_id` (fk)
- `period` (text: last_48h)
- `snow_total` (float)
- `rain_total` (float)
- `observed_start` (timestamptz)
- `observed_end` (timestamptz)
- `fetched_at` (timestamptz)
- `source` (text: model)

**resort_forecast_12h**
- `resort_id` (fk)
- `window_start` (timestamptz)
- `window_end` (timestamptz)
- `snow_sum` (float)
- `rain_sum` (float)
- `temp_min` (float)
- `temp_max` (float)
- `wind_max` (float, nullable)
- `fetched_at` (timestamptz)
- `source` (text: model)

**resort_alerts_active**
- `resort_id` (fk)
- `provider` (text: nws|eccc|other)
- `alert_id` (text)
- `event` (text)
- `severity` (text)
- `effective_start` (timestamptz)
- `effective_end` (timestamptz)
- `headline` (text)
- `summary` (text, nullable)
- `details_url` (text)
- `fetched_at` (timestamptz)
- `raw_payload` (jsonb)

**resort_avalanche_links**
- `resort_id` (fk)
- `provider` (text)
- `area_id` (text, nullable)
- `bulletin_url` (text)
- `fetched_at` (timestamptz)

**drive_time_cache**
- `origin_geohash` (text)
- `resort_id` (fk)
- `departure_time` (timestamptz)
- `duration_seconds` (int)
- `distance_meters` (int)
- `provider` (text)
- `fetched_at` (timestamptz)
- unique: `(origin_geohash, resort_id, departure_time)`

**favorites** *(optional, only if server-side)*
- `anon_user_id` (uuid) OR `user_id`
- `resort_id`
- `created_at`

---

## 8) API Contracts (REST, JSON)

### 8.1 Resort search
`GET /api/resorts?query=whi&country=CA&region=BC`

### 8.2 Resort summary (used by resort page + My Resorts cards)
`GET /api/resorts/{id}/summary`

### 8.3 Full forecast grid (14 windows)
`GET /api/resorts/{id}/forecast-12h?days=7`

### 8.4 Alerts
`GET /api/resorts/{id}/alerts`

### 8.5 Drive planner
`POST /api/drive`

*(See the PRD JSON examples in implementation notes or add them as needed.)*

---

## 9) Background Jobs & Caching

### Schedules (suggested)
- Resort catalog: nightly
- Base depth: every 2–4 hours
- Weather forecast/aggregates: hourly
- Alerts: every 10–15 minutes
- Avalanche links: daily (+ on-demand refresh on open)

### Cache policy
- Summary: per resort ~10 minutes (invalidate on updates)
- Forecast: per resort ~30–60 minutes
- Drive:
  - now: 10–20 minutes
  - tomorrow: 3–6 hours
- Alerts: 5 minutes

---

## 10) Frontend UX Spec (MVP)

### Pages
1. **Home/Search** — search bar, “My Resorts” shortcut
2. **My Resorts Dashboard** — cards for favorites, alert badges, drive shortcut
3. **Resort Detail** — conditions, 48h precip, forecast grid, alerts panel, drive widget
4. **Drive Planner** — location permission + manual override, now/tomorrow results

### UI conventions
- Each widget header includes: `Updated … • Source …`
- Stale data shows small warning icon + tooltip

---

## 11) Security, Privacy, Compliance

- Browser geolocation is used only for routing requests; do not store raw user lat/lon.
- Cache routing by *rounded* origin (geohash) to avoid retaining exact locations.
- Keep routing API keys server-side only.
- Rate limit `/api/drive`.
- Add attribution/footer for data sources.

---

## 12) Observability & Analytics (MVP)

### Metrics
- API latency p50/p95
- cache hit rate
- provider error rates
- job freshness (last successful run times)
- drive API cost estimates (if paid provider)

### Minimal product analytics
- Favorites count and top favorites
- Drive planner usage
- Search-to-resort click-through

---

## 13) Rollout Plan

1. Local dev with 10 sample resorts
2. Full resort catalog + weather forecast + 48h aggregates
3. Base depth integration
4. Drive planner integration + caching + rate limits
5. Alerts + avalanche links
6. My Resorts polish + performance pass

---

## 14) Acceptance Criteria (MVP)

### Functional
- [ ] Search returns resorts across US/CA/MX
- [ ] Resort page shows base depth (or “Not reported”) with freshness + source
- [ ] Last 48h snow vs rain shown with freshness + source
- [ ] Forecast shows 14 12-hour windows (7 days)
- [ ] Drive planner supports Leave now + Tomorrow morning options (4 times)
- [ ] Favorites persisted client-side; My Resorts dashboard renders cards
- [ ] Alerts badges appear when active; panel shows details + external link
- [ ] Avalanche link appears when mapped; otherwise regional fallback

### Non-functional
- [ ] My Resorts loads in ≤ 2s for 10 favorites on broadband (with caching)
- [ ] External API failures degrade gracefully with “Unavailable” + timestamp
- [ ] No permanent storage of raw user location

---

## 15) Open Questions / Decisions Needed

1. Base depth: partner API vs scraping vs partial coverage
2. Routing provider selection + pricing constraints
3. Weather provider selection + self-host requirement strength
4. Avalanche mapping strategy (resort -> forecast area)
5. Mexico alerts/avalanche coverage and fallbacks
