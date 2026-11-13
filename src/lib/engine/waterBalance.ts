// Pure water-balance engine — zero I/O, fully unit-testable
// Implements FAO-56 single-crop-coefficient method

import type { Crop, DayWeather, DayResult, FieldConfig } from "./types";
import {
  CROP_STAGES,
  RAIN_THRESHOLD_MM,
  RAIN_EFFECTIVENESS,
  calcTaw,
  calcRaw,
  DEFAULT_APPLICATION_EFFICIENCY,
} from "./constants";

/**
 * Returns the crop coefficient Kc for a given day after sowing.
 * Linear interpolation between stage mid-points for development stages.
 */
export function kcForDay(crop: Crop, dayIndex: number): number {
  const stages = CROP_STAGES[crop];
  let accumulated = 0;

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const stageEnd = accumulated + stage.lengthDays;

    if (dayIndex < stageEnd) {
      // Inside this stage
      if (i === 0 || i === stages.length - 1) {
        // Initial and late stages use constant Kc
        return stage.kc;
      }
      // Development / mid stages: simple constant for now (can refine to linear later)
      return stage.kc;
    }
    accumulated = stageEnd;
  }

  // After season ends, use final late-stage Kc
  return stages[stages.length - 1].kc;
}

/**
 * Calculate effective rainfall (mm) for a day.
 * Assumption (stated on Method page):
 * - ignore events < 5 mm
 * - count 80% of the rest
 * - cannot exceed current depletion + today's ETc (cap by storage capacity)
 */
export function effectiveRain(
  rainMm: number,
  depletionStart: number,
  etc: number
): number {
  if (rainMm < RAIN_THRESHOLD_MM) return 0;
  const candidate = RAIN_EFFECTIVENESS * rainMm;
  // Cap by how much the root zone can still absorb
  return Math.min(candidate, depletionStart + etc);
}

/**
 * Single-day water balance step.
 *
 * Dr_end(i) = clamp( Dr_end(i-1) − Peff(i) − I(i) + ETc(i) , 0 , TAW )
 *
 * Irrigation decision:
 * irrigate if Dr + ETc_today − Peff_forecast ≥ RAW
 * net depth = Dr (refill to field capacity)
 */
export function stepDay(
  state: { dr: number },
  w: DayWeather,
  kc: number,
  taw: number,
  raw: number,
  ea: number
): { result: DayResult; next: { dr: number } } {
  const etc = kc * w.et0;
  const peff = effectiveRain(w.rain, state.dr, etc);

  // Decision uses this morning's depletion + today's demand − expected rain
  const trigger = state.dr + etc - peff >= raw;
  const net = trigger ? state.dr : 0; // refill to field capacity
  const gross = net / ea;

  // Update depletion
  const drEnd = Math.min(
    Math.max(state.dr - peff - net + etc, 0),
    taw
  );

  return {
    result: {
      date: w.date,
      etc,
      peff,
      depletionStart: state.dr,
      irrigateNetMm: net,
      irrigateGrossMm: gross,
      depletionEnd: drEnd,
      stressed: drEnd > raw,
    },
    next: { dr: drEnd },
  };
}

/**
 * Convenience wrapper that builds TAW/RAW/EA from a FieldConfig
 * and runs a single day.
 */
export function stepDayForField(
  state: { dr: number },
  w: DayWeather,
  config: FieldConfig,
  dayIndex: number
): { result: DayResult; next: { dr: number } } {
  const taw = calcTaw(config.soil);
  const raw = calcRaw(config.soil);
  const ea = config.applicationEfficiency ?? DEFAULT_APPLICATION_EFFICIENCY;
  const kc = kcForDay(config.crop, dayIndex);

  return stepDay(state, w, kc, taw, raw, ea);
}
