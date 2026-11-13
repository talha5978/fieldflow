"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import type {
  Crop,
  SoilType,
  PumpSource,
  FieldConfig,
  DayWeather,
} from "@/lib/engine/types";
import {
  fetchWeatherSafe,
  FALLBACK_SEASON,
  DEMO_LOCATION,
} from "@/lib/weather/openMeteo";
import { simulateAdvised } from "@/lib/engine/simulate";
import { calcRaw, calcTaw } from "@/lib/engine/constants";
import { acresToHa, m3ToLitres } from "@/lib/engine/impact";

function FieldContent() {
  const searchParams = useSearchParams();

  const config: FieldConfig = useMemo(() => {
    const crop = (searchParams.get("crop") as Crop) || "wheat";
    const soil = (searchParams.get("soil") as SoilType) || "loam";
    const pump = (searchParams.get("pump") as PumpSource) || "diesel";
    const areaAcres = Number(searchParams.get("areaAcres") || 5);
    const sowingDate = searchParams.get("sowingDate") || "2025-11-15";
    const headM = Number(searchParams.get("headM") || 30);

    return {
      crop,
      soil,
      pump,
      sowingDate,
      areaHa: acresToHa(areaAcres),
      headM,
      applicationEfficiency: 0.6,
      pumpEfficiency: 0.55,
    };
  }, [searchParams]);

  const [weather, setWeather] = useState<DayWeather[] | null>(null);
  const [source, setSource] = useState<"open-meteo" | "fallback" | "loading">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setSource("loading");
      const result = await fetchWeatherSafe({
        lat: DEMO_LOCATION.lat,
        lon: DEMO_LOCATION.lon,
        pastDays: 3,
        forecastDays: 10,
      });
      if (!cancelled) {
        setWeather(result.weather);
        setSource(result.source);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // While loading, show a short mid-season slice of the fallback (higher Kc).
  const activeWeather = weather ?? FALLBACK_SEASON.slice(45, 60);
  const taw = calcTaw(config.soil);
  const raw = calcRaw(config.soil);

  // Start just below the irrigation trigger so the demo shows both
  // "Irrigate" (dry days) and "Skip" (when rain is enough).
  // A real field mid-cycle is often close to RAW.
  const initialDr = raw * 0.95;

  // dayOffset 50 ≈ mid-season for wheat (higher Kc ~1.15), so demand is realistic
  const season = useMemo(
    () => simulateAdvised(config, activeWeather, initialDr, 50),
    [config, activeWeather, initialDr]
  );

  const today = season.days[0];
  const plan = season.days.slice(0, 8);
  const depletionPct = today ? (today.depletionEnd / taw) * 100 : 0;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-emerald-700/70">
        <span>
          {config.crop} · {config.soil.replace("_", " ")} · {config.pump} pump
        </span>
        <span className="text-emerald-400">·</span>
        <span>{DEMO_LOCATION.name}</span>
        {source === "loading" && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
            Loading weather…
          </span>
        )}
        {source === "open-meteo" && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
            Live Open-Meteo
          </span>
        )}
        {source === "fallback" && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
            Offline fallback season
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold text-emerald-950">
        Today&apos;s recommendation
      </h1>

      {/* Big call-to-action card */}
      {today && (
        <div
          className={`mt-8 rounded-2xl border-2 p-8 ${
            today.irrigateNetMm > 0
              ? "border-amber-400 bg-amber-50"
              : "border-emerald-400 bg-emerald-50"
          }`}
        >
          {today.irrigateNetMm > 0 ? (
            <>
              <div className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                Irrigate today
              </div>
              <div className="mt-2 text-4xl font-bold text-amber-900">
                {today.irrigateGrossMm.toFixed(0)} mm
              </div>
              <p className="mt-2 text-amber-800">
                ≈{" "}
                {Math.round(
                  m3ToLitres(today.irrigateGrossMm * config.areaHa * 10)
                ).toLocaleString()}{" "}
                litres for your field
              </p>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Skip irrigation
              </div>
              <div className="mt-2 text-4xl font-bold text-emerald-900">
                No water needed
              </div>
              <p className="mt-2 text-emerald-800">
                {today.peff > 0
                  ? `Rain expected / already effective (${today.peff.toFixed(1)} mm)`
                  : "Root zone still holds enough moisture"}
              </p>
            </>
          )}
        </div>
      )}

      {/* Soil water gauge */}
      <div className="mt-10 rounded-2xl border border-emerald-100 bg-white p-6">
        <h2 className="font-semibold text-emerald-900">Soil-water status</h2>
        <div className="mt-4 h-6 w-full overflow-hidden rounded-full bg-emerald-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(100, 100 - depletionPct)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-emerald-700/70">
          <span>Field capacity</span>
          <span>
            Depletion {today?.depletionEnd.toFixed(0) ?? 0} mm / RAW{" "}
            {raw.toFixed(0)} mm
          </span>
          <span>Stress zone</span>
        </div>
      </div>

      {/* 7-day plan */}
      <div className="mt-10">
        <h2 className="font-semibold text-emerald-900">Next 7 days</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-100 text-emerald-700/70">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">ETc</th>
                <th className="py-2 pr-4">Rain (eff.)</th>
                <th className="py-2 pr-4">Advice</th>
                <th className="py-2">Depth (gross)</th>
              </tr>
            </thead>
            <tbody>
              {plan.map((d) => (
                <tr key={d.date} className="border-b border-emerald-50">
                  <td className="py-3 pr-4 font-medium">{d.date.slice(5)}</td>
                  <td className="py-3 pr-4">{d.etc.toFixed(1)} mm</td>
                  <td className="py-3 pr-4">
                    {d.peff > 0 ? `${d.peff.toFixed(1)} mm` : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    {d.irrigateNetMm > 0 ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                        Irrigate
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                        Skip
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {d.irrigateGrossMm > 0
                      ? `${d.irrigateGrossMm.toFixed(0)} mm`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default function FieldPage() {
  return (
    <div className="min-h-screen bg-emerald-50/40">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-emerald-900"
          >
            <span>🌾</span> FieldFlow
          </Link>
          <Link
            href="/impact"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            View season impact →
          </Link>
        </div>
      </header>

      <Suspense
        fallback={
          <main className="mx-auto max-w-4xl px-6 py-10">
            <p className="text-emerald-700">Loading field data…</p>
          </main>
        }
      >
        <FieldContent />
      </Suspense>
    </div>
  );
}
