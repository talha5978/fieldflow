// Sourced constants for FieldFlow
// Every value includes a comment with the FAO-56 table or other source.
// Verify against primary sources before shipping.

import type { Crop, SoilType, GrowthStage } from "./types";

// ---------------------------------------------------------------------------
// Crop coefficients and stage lengths
// Source: FAO-56 Tables 11 & 12 (approximate single Kc values for mid-latitude)
// ---------------------------------------------------------------------------

export const CROP_STAGES: Record<Crop, GrowthStage[]> = {
  wheat: [
    { name: "initial", lengthDays: 30, kc: 0.3 },
    { name: "development", lengthDays: 40, kc: 0.7 }, // linear interpolation midpoint
    { name: "mid", lengthDays: 50, kc: 1.15 },
    { name: "late", lengthDays: 30, kc: 0.25 },
  ],
  maize: [
    { name: "initial", lengthDays: 25, kc: 0.3 },
    { name: "development", lengthDays: 40, kc: 0.75 },
    { name: "mid", lengthDays: 50, kc: 1.2 },
    { name: "late", lengthDays: 30, kc: 0.6 },
  ],
};

// Total growing season length (days) derived from stages
export function seasonLength(crop: Crop): number {
  return CROP_STAGES[crop].reduce((sum, s) => sum + s.lengthDays, 0);
}

// ---------------------------------------------------------------------------
// Soil parameters
// Source: FAO-56 Table 19 (θFC − θWP) and Table 22 (p, Zr)
// ---------------------------------------------------------------------------

export interface SoilParams {
  /** Field capacity − permanent wilting point (m³/m³) */
  thetaAvailable: number;
  /** Depletion fraction for no stress (p) */
  p: number;
  /** Maximum rooting depth Zr (m) for the crop group */
  zrM: number;
}

export const SOIL_PARAMS: Record<SoilType, SoilParams> = {
  // sandy loam ≈ medium texture group
  sandy_loam: {
    thetaAvailable: 0.12, // FAO-56 Table 19 approximate
    p: 0.55, // Table 22 typical for cereals
    zrM: 1.0, // wheat/maize typical max root depth
  },
  loam: {
    thetaAvailable: 0.15,
    p: 0.55,
    zrM: 1.2,
  },
  clay_loam: {
    thetaAvailable: 0.18,
    p: 0.5,
    zrM: 1.0,
  },
};

// ---------------------------------------------------------------------------
// Application & pump defaults
// ---------------------------------------------------------------------------

export const DEFAULT_APPLICATION_EFFICIENCY = 0.6; // flood irrigation typical

export const DEFAULT_PUMP_EFFICIENCY = 0.55; // wire-to-water, realistic for small tubewells
export const DEFAULT_HEAD_M = 30; // metres, typical for shallow tubewell

// ---------------------------------------------------------------------------
// Energy & emissions factors
// ---------------------------------------------------------------------------

/**
 * Pumping energy formula coefficient:
 * kWh = 0.00272 × m³ × H / η
 * Source: standard hydraulic formula (g / 3600 ≈ 0.00272)
 */
export const ENERGY_COEFF = 0.00272;

/**
 * Assumed shaft energy per litre of diesel (kWh/L)
 * Typical small diesel engine ~3.0–3.5 kWh/L output.
 * Labelled constant so it can be adjusted.
 */
export const DIESEL_KWH_PER_LITRE = 3.2;

/**
 * Pakistan grid emission factor (kg CO₂e / kWh)
 * Source: approximate from Ember / national inventories (verify for submission)
 * Typical range for Pakistan ~0.45–0.55
 */
export const GRID_EF_KG_PER_KWH = 0.5;

/**
 * Diesel emission factor (kg CO₂e / litre)
 * Source: IPCC / DEFRA typical value ~2.68 kg CO₂e / L
 */
export const DIESEL_EF_KG_PER_LITRE = 2.68;

// ---------------------------------------------------------------------------
// Effective rainfall assumptions (stated in Method page)
// ---------------------------------------------------------------------------

/** Events under this threshold (mm) are ignored */
export const RAIN_THRESHOLD_MM = 5;

/** Fraction of rainfall above threshold that is considered effective */
export const RAIN_EFFECTIVENESS = 0.8;

// ---------------------------------------------------------------------------
// Baseline irrigation defaults (Pakistan agricultural practice)
// These should be editable and sensitivity-tested.
// Source: typical extension recommendations for wheat/maize in irrigated areas
// ---------------------------------------------------------------------------

export const DEFAULT_BASELINE = {
  wheat: { intervalDays: 14, depthMm: 60 },
  maize: { intervalDays: 12, depthMm: 55 },
} as const;

// ---------------------------------------------------------------------------
// Helper: Total Available Water (TAW) in mm
// TAW = 1000 × (θFC − θWP) × Zr
// ---------------------------------------------------------------------------
export function calcTaw(soil: SoilType): number {
  const s = SOIL_PARAMS[soil];
  return 1000 * s.thetaAvailable * s.zrM;
}

// ---------------------------------------------------------------------------
// Helper: Readily Available Water (RAW) in mm
// RAW = p × TAW
// ---------------------------------------------------------------------------
export function calcRaw(soil: SoilType): number {
  const s = SOIL_PARAMS[soil];
  return s.p * calcTaw(soil);
}
