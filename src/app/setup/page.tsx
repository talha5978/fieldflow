"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Crop, SoilType, PumpSource } from "@/lib/engine/types";

export default function SetupPage() {
  const router = useRouter();
  const [crop, setCrop] = useState<Crop>("wheat");
  const [soil, setSoil] = useState<SoilType>("loam");
  const [pump, setPump] = useState<PumpSource>("diesel");
  const [areaAcres, setAreaAcres] = useState(5);
  const [sowingDate, setSowingDate] = useState("2025-11-15");
  const [headM, setHeadM] = useState(30);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // For now we encode config in the URL (no database)
    const params = new URLSearchParams({
      crop,
      soil,
      pump,
      areaAcres: String(areaAcres),
      sowingDate,
      headM: String(headM),
    });
    router.push(`/field/demo?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-emerald-50/50">
      <header className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-900">
            <span>🌾</span> FieldFlow
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-emerald-950">Set up your field</h1>
        <p className="mt-2 text-emerald-800/70">
          Tell us about the crop, soil and pump. We will calculate daily advice
          using FAO-56 and local weather.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          {/* Crop */}
          <fieldset>
            <legend className="text-sm font-semibold text-emerald-900">Crop</legend>
            <div className="mt-3 flex gap-4">
              {(["wheat", "maize"] as Crop[]).map((c) => (
                <label
                  key={c}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 ${
                    crop === c
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-emerald-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="crop"
                    value={c}
                    checked={crop === c}
                    onChange={() => setCrop(c)}
                    className="accent-emerald-600"
                  />
                  <span className="capitalize">{c}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Soil */}
          <fieldset>
            <legend className="text-sm font-semibold text-emerald-900">Soil type</legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {(
                [
                  ["sandy_loam", "Sandy loam"],
                  ["loam", "Loam"],
                  ["clay_loam", "Clay loam"],
                ] as [SoilType, string][]
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 ${
                    soil === value
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-emerald-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="soil"
                    value={value}
                    checked={soil === value}
                    onChange={() => setSoil(value)}
                    className="accent-emerald-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Pump */}
          <fieldset>
            <legend className="text-sm font-semibold text-emerald-900">Water source / pump</legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {(
                [
                  ["electric", "Electric tubewell"],
                  ["diesel", "Diesel tubewell"],
                  ["canal", "Canal (no pumping)"],
                ] as [PumpSource, string][]
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 ${
                    pump === value
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-emerald-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="pump"
                    value={value}
                    checked={pump === value}
                    onChange={() => setPump(value)}
                    className="accent-emerald-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Numbers */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-emerald-900">
                Area (acres)
              </label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={areaAcres}
                onChange={(e) => setAreaAcres(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-emerald-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-emerald-900">
                Sowing date
              </label>
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="mt-2 w-full rounded-lg border border-emerald-200 px-3 py-2"
              />
            </div>
            {pump !== "canal" && (
              <div>
                <label className="text-sm font-semibold text-emerald-900">
                  Total head (metres)
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={headM}
                  onChange={(e) => setHeadM(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-emerald-200 px-3 py-2"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 sm:w-auto sm:px-10"
          >
            Get irrigation advice →
          </button>
        </form>
      </main>
    </div>
  );
}
