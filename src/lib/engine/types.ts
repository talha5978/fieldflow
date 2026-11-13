// Core types for FieldFlow irrigation engine
// Pure data structures — no I/O

export type Crop = "wheat" | "maize";
export type SoilType = "sandy_loam" | "loam" | "clay_loam";
export type PumpSource = "electric" | "diesel" | "canal";

export interface FieldConfig {
  crop: Crop;
  sowingDate: string; // ISO date YYYY-MM-DD
  areaHa: number;
  soil: SoilType;
  pump: PumpSource;
  headM?: number; // total dynamic head in metres
  pumpEfficiency?: number; // 0–1, wire-to-water
  applicationEfficiency: number; // default 0.6 for flood irrigation
}

export interface DayWeather {
  date: string; // YYYY-MM-DD
  et0: number; // FAO reference ET (mm/day)
  rain: number; // precipitation sum (mm)
}

export interface DayResult {
  date: string;
  etc: number; // crop ET (mm)
  peff: number; // effective rainfall (mm)
  depletionStart: number; // Dr at start of day (mm)
  irrigateNetMm: number; // 0 if skip
  irrigateGrossMm: number;
  depletionEnd: number; // Dr at end of day (mm)
  stressed: boolean; // depletionEnd > RAW
}

export interface SeasonResult {
  days: DayResult[];
  totalNetMm: number;
  totalGrossMm: number;
  totalVolumeM3: number;
  stressDays: number;
  irrigationEvents: number;
}

export interface ImpactResult {
  waterSavedM3: number;
  energySavedKwh: number | null; // null for canal
  dieselSavedL: number | null;
  co2eSavedKg: number | null;
  stressDaysAdvised: number;
  stressDaysBaseline: number;
}

export interface BaselineConfig {
  intervalDays: number; // irrigate every N days
  depthMm: number; // net depth applied each time
}

export interface GrowthStage {
  name: string;
  lengthDays: number;
  kc: number;
}
