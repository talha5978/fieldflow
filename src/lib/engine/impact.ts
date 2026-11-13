// Impact calculations: litres → energy → CO₂e
// Pure functions

import type { FieldConfig, SeasonResult, ImpactResult, PumpSource } from "./types";
import {
  ENERGY_COEFF,
  DIESEL_KWH_PER_LITRE,
  GRID_EF_KG_PER_KWH,
  DIESEL_EF_KG_PER_LITRE,
  DEFAULT_HEAD_M,
  DEFAULT_PUMP_EFFICIENCY,
} from "./constants";

/**
 * Pumping energy (kWh) for a volume of water.
 * kWh = 0.00272 × m³ × H / η
 * Returns null for canal (no pumping).
 */
export function pumpingEnergyKwh(
  volumeM3: number,
  pump: PumpSource,
  headM: number = DEFAULT_HEAD_M,
  efficiency: number = DEFAULT_PUMP_EFFICIENCY
): number | null {
  if (pump === "canal") return null;
  if (volumeM3 <= 0) return 0;
  return (ENERGY_COEFF * volumeM3 * headM) / efficiency;
}

/**
 * Convert shaft energy to diesel litres.
 */
export function dieselLitres(kwh: number): number {
  return kwh / DIESEL_KWH_PER_LITRE;
}

/**
 * CO₂e for a given energy amount and pump type.
 */
export function co2eKg(
  energyKwh: number | null,
  pump: PumpSource
): number | null {
  if (energyKwh === null || pump === "canal") return null;
  if (pump === "electric") {
    return energyKwh * GRID_EF_KG_PER_KWH;
  }
  // diesel
  const litres = dieselLitres(energyKwh);
  return litres * DIESEL_EF_KG_PER_LITRE;
}

/**
 * Full impact comparison between advised and baseline seasons.
 */
export function calculateImpact(
  config: FieldConfig,
  advised: SeasonResult,
  baseline: SeasonResult
): ImpactResult {
  const waterSavedM3 = baseline.totalVolumeM3 - advised.totalVolumeM3;

  const head = config.headM ?? DEFAULT_HEAD_M;
  const eta = config.pumpEfficiency ?? DEFAULT_PUMP_EFFICIENCY;

  const energyAdvised = pumpingEnergyKwh(
    advised.totalVolumeM3,
    config.pump,
    head,
    eta
  );
  const energyBaseline = pumpingEnergyKwh(
    baseline.totalVolumeM3,
    config.pump,
    head,
    eta
  );

  let energySavedKwh: number | null = null;
  let dieselSavedL: number | null = null;
  let co2eSavedKg: number | null = null;

  if (config.pump !== "canal" && energyAdvised !== null && energyBaseline !== null) {
    energySavedKwh = energyBaseline - energyAdvised;
    if (config.pump === "diesel") {
      dieselSavedL = dieselLitres(energySavedKwh);
    }
    const co2Advised = co2eKg(energyAdvised, config.pump);
    const co2Baseline = co2eKg(energyBaseline, config.pump);
    if (co2Advised !== null && co2Baseline !== null) {
      co2eSavedKg = co2Baseline - co2Advised;
    }
  }

  return {
    waterSavedM3,
    energySavedKwh,
    dieselSavedL,
    co2eSavedKg,
    stressDaysAdvised: advised.stressDays,
    stressDaysBaseline: baseline.stressDays,
  };
}

/**
 * Human-friendly volume helpers.
 */
export function m3ToLitres(m3: number): number {
  return m3 * 1000;
}

export function mmToM3(mm: number, areaHa: number): number {
  return mm * areaHa * 10;
}

/** 1 acre = 0.4047 ha */
export function acresToHa(acres: number): number {
  return acres * 0.4047;
}

export function haToAcres(ha: number): number {
  return ha / 0.4047;
}
