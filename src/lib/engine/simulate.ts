// Season simulation: advised schedule vs fixed-interval baseline
// Pure functions only

import type {
  FieldConfig,
  DayWeather,
  DayResult,
  SeasonResult,
  BaselineConfig,
} from "./types";
import { stepDay } from "./waterBalance";
import {
  calcTaw,
  calcRaw,
  DEFAULT_APPLICATION_EFFICIENCY,
  DEFAULT_BASELINE,
} from "./constants";
import { kcForDay } from "./waterBalance";

/**
 * Run the advised (science-based) schedule over a sequence of weather days.
 * Starts from full field capacity (Dr = 0) on sowing day by default.
 * Pass initialDr to start part-way through a cycle (useful for "today" demos).
 * Pass dayOffset so Kc is taken from a later growth stage when showing a short window.
 */
export function simulateAdvised(
  config: FieldConfig,
  weather: DayWeather[],
  initialDr = 0,
  dayOffset = 0
): SeasonResult {
  const taw = calcTaw(config.soil);
  const raw = calcRaw(config.soil);
  const ea = config.applicationEfficiency ?? DEFAULT_APPLICATION_EFFICIENCY;

  let state = { dr: Math.min(Math.max(initialDr, 0), taw) };
  const days: DayResult[] = [];

  for (let i = 0; i < weather.length; i++) {
    const kc = kcForDay(config.crop, i + dayOffset);
    const { result, next } = stepDay(state, weather[i], kc, taw, raw, ea);
    days.push(result);
    state = next;
  }

  return aggregate(days, config.areaHa);
}

/**
 * Fixed-interval baseline: irrigate every N days with D mm (net).
 * Same weather series, same soil parameters.
 */
export function simulateBaseline(
  config: FieldConfig,
  weather: DayWeather[],
  baseline?: BaselineConfig
): SeasonResult {
  const base =
    baseline ??
    DEFAULT_BASELINE[config.crop] ??
    { intervalDays: 14, depthMm: 60 };

  const taw = calcTaw(config.soil);
  const raw = calcRaw(config.soil);
  const ea = config.applicationEfficiency ?? DEFAULT_APPLICATION_EFFICIENCY;

  let state = { dr: 0 };
  const days: DayResult[] = [];
  let daysSinceIrrigation = 0;

  for (let i = 0; i < weather.length; i++) {
    const kc = kcForDay(config.crop, i);
    const etc = kc * weather[i].et0;
    // We still compute peff the same way for fair comparison
    const peff =
      weather[i].rain < 5
        ? 0
        : Math.min(0.8 * weather[i].rain, state.dr + etc);

    daysSinceIrrigation += 1;
    const shouldIrrigate = daysSinceIrrigation >= base.intervalDays;
    const net = shouldIrrigate ? base.depthMm : 0;
    if (shouldIrrigate) daysSinceIrrigation = 0;

    const gross = net / ea;
    const drEnd = Math.min(Math.max(state.dr - peff - net + etc, 0), taw);

    days.push({
      date: weather[i].date,
      etc,
      peff,
      depletionStart: state.dr,
      irrigateNetMm: net,
      irrigateGrossMm: gross,
      depletionEnd: drEnd,
      stressed: drEnd > raw,
    });

    state = { dr: drEnd };
  }

  return aggregate(days, config.areaHa);
}

function aggregate(days: DayResult[], areaHa: number): SeasonResult {
  const totalNetMm = days.reduce((s, d) => s + d.irrigateNetMm, 0);
  const totalGrossMm = days.reduce((s, d) => s + d.irrigateGrossMm, 0);
  // Volume: m³ = mm × ha × 10
  const totalVolumeM3 = totalGrossMm * areaHa * 10;
  const stressDays = days.filter((d) => d.stressed).length;
  const irrigationEvents = days.filter((d) => d.irrigateNetMm > 0).length;

  return {
    days,
    totalNetMm,
    totalGrossMm,
    totalVolumeM3,
    stressDays,
    irrigationEvents,
  };
}

/**
 * Convenience: run both advised and baseline and return both results.
 */
export function simulateSeason(
  config: FieldConfig,
  weather: DayWeather[],
  baseline?: BaselineConfig
): { advised: SeasonResult; baseline: SeasonResult } {
  return {
    advised: simulateAdvised(config, weather),
    baseline: simulateBaseline(config, weather, baseline),
  };
}
