"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { FieldConfig, BaselineConfig } from "@/lib/engine/types";
import { FALLBACK_SEASON } from "@/lib/weather/openMeteo";
import { simulateSeason } from "@/lib/engine/simulate";
import { calculateImpact, m3ToLitres, acresToHa } from "@/lib/engine/impact";
import { DEFAULT_BASELINE } from "@/lib/engine/constants";

const demoConfig: FieldConfig = {
  crop: "wheat",
  sowingDate: "2024-11-15",
  areaHa: acresToHa(5),
  soil: "loam",
  pump: "diesel",
  headM: 30,
  pumpEfficiency: 0.55,
  applicationEfficiency: 0.6,
};

/** Baseline sensitivity presets */
const BASELINE_PRESETS: Record<
  string,
  { label: string; description: string; config: BaselineConfig }
> = {
  conservative: {
    label: "Conservative",
    description: "Every 18 days · 50 mm",
    config: { intervalDays: 18, depthMm: 50 },
  },
  typical: {
    label: "Typical",
    description: "Every 14 days · 60 mm",
    config: DEFAULT_BASELINE.wheat,
  },
  wasteful: {
    label: "Wasteful",
    description: "Every 10 days · 70 mm",
    config: { intervalDays: 10, depthMm: 70 },
  },
};

export default function ImpactPage() {
  const [baselineKey, setBaselineKey] = useState<keyof typeof BASELINE_PRESETS>("typical");

  const { advised, baseline, impact, chartData } = useMemo(() => {
    const weather = FALLBACK_SEASON;
    const baselineCfg = BASELINE_PRESETS[baselineKey].config;
    const { advised, baseline } = simulateSeason(demoConfig, weather, baselineCfg);
    const impact = calculateImpact(demoConfig, advised, baseline);

    // Build cumulative series for the chart
    let cumAdvised = 0;
    let cumBaseline = 0;
    const chartData = advised.days.map((d, i) => {
      cumAdvised += d.irrigateGrossMm * demoConfig.areaHa * 10; // m³
      cumBaseline += baseline.days[i].irrigateGrossMm * demoConfig.areaHa * 10;
      return {
        day: i + 1,
        date: d.date.slice(5),
        advised: Math.round(cumAdvised),
        baseline: Math.round(cumBaseline),
      };
    });

    return { advised, baseline, impact, chartData };
  }, [baselineKey]);

  const waterSavedL = Math.round(m3ToLitres(impact.waterSavedM3));
  const dieselSaved = impact.dieselSavedL ? Math.round(impact.dieselSavedL) : null;
  const co2Saved = impact.co2eSavedKg ? Math.round(impact.co2eSavedKg) : null;

  return (
    <div className="min-h-screen bg-emerald-50/40">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-900">
            <span>🌾</span> FieldFlow
          </Link>
          <Link
            href="/method"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            How the numbers are calculated →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold text-emerald-950">
          Season impact — Demo wheat field (5 acres)
        </h1>
        <p className="mt-2 text-emerald-800/70">
          Comparison of science-based advice vs a fixed-schedule baseline over a
          full season. All figures are estimates based on FAO-56 and the stated
          assumptions.
        </p>

        {/* Baseline sensitivity selector */}
        <div className="mt-8">
          <div className="text-sm font-semibold text-emerald-900">
            Baseline scenario
          </div>
          <p className="mt-1 text-xs text-emerald-700/60">
            Change the assumed fixed schedule to see how sensitive the savings
            are. Typical = common extension practice.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {(Object.keys(BASELINE_PRESETS) as Array<keyof typeof BASELINE_PRESETS>).map(
              (key) => {
                const preset = BASELINE_PRESETS[key];
                const active = baselineKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setBaselineKey(key)}
                    className={`rounded-xl border px-4 py-2.5 text-left transition ${
                      active
                        ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                        : "border-emerald-200 bg-white hover:border-emerald-400"
                    }`}
                  >
                    <div className="text-sm font-semibold text-emerald-900">
                      {preset.label}
                    </div>
                    <div className="text-xs text-emerald-700/70">
                      {preset.description}
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Headline cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-emerald-700">Water saved</div>
            <div className="mt-2 text-3xl font-bold text-emerald-900">
              {waterSavedL.toLocaleString()} L
            </div>
            <p className="mt-1 text-xs text-emerald-700/60">
              ≈ {impact.waterSavedM3.toFixed(0)} m³
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-emerald-700">Diesel avoided</div>
            <div className="mt-2 text-3xl font-bold text-emerald-900">
              {dieselSaved !== null ? `${dieselSaved} L` : "—"}
            </div>
            <p className="mt-1 text-xs text-emerald-700/60">
              {impact.energySavedKwh
                ? `≈ ${impact.energySavedKwh.toFixed(0)} kWh shaft energy`
                : "Canal source — no pumping"}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-emerald-700">CO₂e avoided</div>
            <div className="mt-2 text-3xl font-bold text-emerald-900">
              {co2Saved !== null ? `${co2Saved} kg` : "—"}
            </div>
            <p className="mt-1 text-xs text-emerald-700/60">
              Estimated using diesel EF 2.68 kg/L
            </p>
          </div>
        </div>

        {/* Cumulative water chart */}
        <div className="mt-10 rounded-2xl border border-emerald-100 bg-white p-6">
          <h2 className="font-semibold text-emerald-900">
            Cumulative irrigation volume (m³)
          </h2>
          <p className="mt-1 text-sm text-emerald-800/70">
            FieldFlow advice vs the selected fixed baseline over the season.
          </p>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#047857" }}
                  label={{
                    value: "Day of season",
                    position: "insideBottom",
                    offset: -2,
                    style: { fontSize: 11, fill: "#047857" },
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#047857" }}
                  label={{
                    value: "m³",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "#047857" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: "#a7f3d0",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value ?? 0} m³`, ""]}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="advised"
                  name="FieldFlow"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Baseline"
                  stroke="#d97706"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <div>
              <span className="font-medium text-emerald-800">FieldFlow total: </span>
              {Math.round(m3ToLitres(advised.totalVolumeM3)).toLocaleString()} L
              <span className="ml-1 text-emerald-600">
                ({advised.irrigationEvents} events)
              </span>
            </div>
            <div>
              <span className="font-medium text-amber-800">Baseline total: </span>
              {Math.round(m3ToLitres(baseline.totalVolumeM3)).toLocaleString()} L
              <span className="ml-1 text-amber-600">
                ({baseline.irrigationEvents} events)
              </span>
            </div>
          </div>
        </div>

        {/* Stress days comparison */}
        <div className="mt-10 rounded-2xl border border-emerald-100 bg-white p-6">
          <h2 className="font-semibold text-emerald-900">Crop stress days</h2>
          <p className="mt-1 text-sm text-emerald-800/70">
            Days where root-zone depletion exceeded the readily available water
            (RAW). A lower number is better for the crop. Showing that the
            baseline sometimes under-waters makes the savings claim more
            credible.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-emerald-50 p-4">
              <div className="text-sm text-emerald-700">FieldFlow advice</div>
              <div className="text-2xl font-bold text-emerald-900">
                {impact.stressDaysAdvised} days
              </div>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <div className="text-sm text-amber-700">Fixed baseline</div>
              <div className="text-2xl font-bold text-amber-900">
                {impact.stressDaysBaseline} days
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/setup"
            className="inline-block rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Try with your own field
          </Link>
        </div>
      </main>
    </div>
  );
}
