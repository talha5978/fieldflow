// Open-Meteo client — free, no API key
// Fetches daily ET0 (FAO) and precipitation.
// Always provide a committed fallback season so the demo never breaks.

import { z } from "zod";
import type { DayWeather } from "@/lib/engine/types";

const OpenMeteoDailySchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    et0_fao_evapotranspiration: z.array(z.number().nullable()),
    precipitation_sum: z.array(z.number().nullable()),
  }),
});

export type OpenMeteoResponse = z.infer<typeof OpenMeteoDailySchema>;

/**
 * Map Open-Meteo daily arrays into the engine's DayWeather shape.
 */
export function mapToDayWeather(data: OpenMeteoResponse): DayWeather[] {
  const { time, et0_fao_evapotranspiration, precipitation_sum } = data.daily;
  return time.map((date, i) => ({
    date,
    et0: et0_fao_evapotranspiration[i] ?? 0,
    rain: precipitation_sum[i] ?? 0,
  }));
}

/**
 * Fetch forecast (or archive) from Open-Meteo.
 * Uses past_days to cover recent history when needed.
 *
 * Example:
 *   fetchWeather({ lat: 31.5, lon: 74.3, pastDays: 7, forecastDays: 7 })
 */
export async function fetchWeather(opts: {
  lat: number;
  lon: number;
  pastDays?: number;
  forecastDays?: number;
  startDate?: string; // for archive
  endDate?: string;
}): Promise<DayWeather[]> {
  const { lat, lon, pastDays = 0, forecastDays = 7, startDate, endDate } = opts;

  let url: string;

  if (startDate && endDate) {
    // Historical archive
    url =
      `https://archive-api.open-meteo.com/v1/archive?` +
      `latitude=${lat}&longitude=${lon}` +
      `&start_date=${startDate}&end_date=${endDate}` +
      `&daily=et0_fao_evapotranspiration,precipitation_sum` +
      `&timezone=auto`;
  } else {
    // Forecast + recent past
    url =
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&longitude=${lon}` +
      `&daily=et0_fao_evapotranspiration,precipitation_sum` +
      `&past_days=${pastDays}&forecast_days=${forecastDays}` +
      `&timezone=auto`;
  }

  const res = await fetch(url, {
    next: { revalidate: 10800 }, // 3 h cache
  });
  if (!res.ok) {
    throw new Error(`Open-Meteo error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const parsed = OpenMeteoDailySchema.parse(json);
  return mapToDayWeather(parsed);
}

/**
 * Safe wrapper: tries Open-Meteo, falls back to committed season on any failure.
 * Use this from client components so the demo never breaks.
 */
export async function fetchWeatherSafe(opts: {
  lat: number;
  lon: number;
  pastDays?: number;
  forecastDays?: number;
  startDate?: string;
  endDate?: string;
}): Promise<{ weather: DayWeather[]; source: "open-meteo" | "fallback" }> {
  try {
    const weather = await fetchWeather(opts);
    if (!weather.length) throw new Error("Empty response");
    return { weather, source: "open-meteo" };
  } catch {
    // Return a slice of the fallback that roughly matches the requested window
    const days = (opts.forecastDays ?? 7) + (opts.pastDays ?? 0);
    return {
      weather: FALLBACK_SEASON.slice(0, Math.max(days, 14)),
      source: "fallback",
    };
  }
}

/**
 * Deterministic fallback season (committed to repo).
 * Realistic 100-day wheat season values typical of Punjab (Faisalabad area).
 * No Math.random — same numbers every run so tests and demos are stable.
 */
export const FALLBACK_SEASON: DayWeather[] = generateFallbackSeason();

function generateFallbackSeason(): DayWeather[] {
  const days: DayWeather[] = [];
  const start = new Date("2024-11-15");

  // Sparse rain events — mostly dry so irrigation is clearly needed
  const rainEvents: Record<number, number> = {
    12: 8.0,
    28: 15.5,
    47: 6.2,
    61: 20.0,
    82: 11.4,
  };

  for (let i = 0; i < 100; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const date = d.toISOString().slice(0, 10);

    // ET0 ~2–5 mm in winter, rising later. Slightly higher so depletion builds.
    const et0Base =
      2.8 + Math.sin(i / 18) * 1.2 + (i > 50 ? (i - 50) * 0.03 : 0);
    const variation = ((i * 17) % 10) / 20 - 0.2;
    const et0 = Math.max(1.2, +(et0Base + variation).toFixed(2));

    const rain = rainEvents[i] ?? 0;

    days.push({ date, et0, rain });
  }
  return days;
}

/** Default demo location: Faisalabad, Punjab, Pakistan */
export const DEMO_LOCATION = {
  lat: 31.4504,
  lon: 73.135,
  name: "Faisalabad, Pakistan",
};
