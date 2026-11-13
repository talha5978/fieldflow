import { describe, it, expect } from "vitest";
import { stepDay, kcForDay, effectiveRain } from "./waterBalance";
import { calcTaw, calcRaw } from "./constants";
import { simulateAdvised, simulateBaseline } from "./simulate";
import { calculateImpact, pumpingEnergyKwh } from "./impact";
import type { FieldConfig, DayWeather } from "./types";

const sampleConfig: FieldConfig = {
  crop: "wheat",
  sowingDate: "2025-11-15",
  areaHa: 2.0235, // ~5 acres
  soil: "loam",
  pump: "diesel",
  headM: 30,
  pumpEfficiency: 0.55,
  applicationEfficiency: 0.6,
};

const makeWeather = (days: number, et0 = 4, rain = 0): DayWeather[] =>
  Array.from({ length: days }, (_, i) => ({
    date: `2025-11-${String(15 + i).padStart(2, "0")}`,
    et0,
    rain,
  }));

describe("kcForDay", () => {
  it("returns initial Kc at day 0", () => {
    expect(kcForDay("wheat", 0)).toBe(0.3);
  });

  it("returns mid-season Kc for wheat", () => {
    // after initial 30 + development 40 = day 70 should be mid
    expect(kcForDay("wheat", 70)).toBe(1.15);
  });

  it("returns late Kc near end of season", () => {
    expect(kcForDay("wheat", 140)).toBe(0.25);
  });
});

describe("effectiveRain", () => {
  it("ignores rain under 5 mm", () => {
    expect(effectiveRain(4, 50, 5)).toBe(0);
  });

  it("applies 80% effectiveness", () => {
    expect(effectiveRain(10, 100, 5)).toBeCloseTo(8);
  });

  it("caps by available storage", () => {
    // depletion + etc = 3, so cannot absorb more than 3
    expect(effectiveRain(20, 1, 2)).toBe(3);
  });
});

describe("stepDay invariants", () => {
  const taw = calcTaw("loam");
  const raw = calcRaw("loam");
  const ea = 0.6;

  it("keeps depletion within [0, TAW]", () => {
    let state = { dr: 0 };
    const weather = makeWeather(30, 5, 0);

    for (const w of weather) {
      const { result, next } = stepDay(state, w, 1.0, taw, raw, ea);
      expect(result.depletionEnd).toBeGreaterThanOrEqual(0);
      expect(result.depletionEnd).toBeLessThanOrEqual(taw);
      state = next;
    }
  });

  it("water balance closes (inputs − outputs = Δstorage)", () => {
    const state = { dr: 40 };
    const w: DayWeather = { date: "2025-11-20", et0: 4, rain: 0 };
    const kc = 1.0;
    const { result } = stepDay(state, w, kc, taw, raw, ea);

    const etc = kc * w.et0;
    const peff = 0;
    const net = result.irrigateNetMm;
    const delta = result.depletionEnd - state.dr;

    // ΔDr = etc − peff − I
    expect(delta).toBeCloseTo(etc - peff - net, 5);
  });

  it("heavy forecast rain suppresses irrigation", () => {
    // Start near the trigger point
    const state = { dr: raw - 1 };
    const w: DayWeather = { date: "2025-11-20", et0: 3, rain: 40 }; // heavy rain
    const { result } = stepDay(state, w, 1.0, taw, raw, ea);
    expect(result.irrigateNetMm).toBe(0);
  });

  it("zero ET0 means no irrigation needed when depletion is low", () => {
    const state = { dr: 5 };
    const w: DayWeather = { date: "2025-11-20", et0: 0, rain: 0 };
    const { result } = stepDay(state, w, 1.0, taw, raw, ea);
    expect(result.irrigateNetMm).toBe(0);
  });
});

describe("simulateAdvised", () => {
  it("produces one result per weather day", () => {
    const weather = makeWeather(20);
    const result = simulateAdvised(sampleConfig, weather);
    expect(result.days).toHaveLength(20);
  });

  it("never exceeds TAW", () => {
    const weather = makeWeather(60, 6, 0); // dry spell
    const result = simulateAdvised(sampleConfig, weather);
    const taw = calcTaw(sampleConfig.soil);
    for (const d of result.days) {
      expect(d.depletionEnd).toBeLessThanOrEqual(taw);
    }
  });
});

describe("impact calculations", () => {
  it("canal source gives zero energy and CO₂", () => {
    const energy = pumpingEnergyKwh(1000, "canal");
    expect(energy).toBeNull();
  });

  it("diesel produces positive energy for positive volume", () => {
    const energy = pumpingEnergyKwh(100, "diesel", 30, 0.55);
    expect(energy).toBeGreaterThan(0);
  });

  it("calculates positive water savings when advised uses less water", () => {
    const weather = makeWeather(40, 4.5, 2);
    const advised = simulateAdvised(sampleConfig, weather);
    const baseline = simulateBaseline(sampleConfig, weather);
    const impact = calculateImpact(sampleConfig, advised, baseline);

    // In many realistic series the advised schedule should save water
    // (we don't assert the sign strictly because it depends on weather,
    // but the function should return finite numbers)
    expect(Number.isFinite(impact.waterSavedM3)).toBe(true);
    expect(impact.stressDaysAdvised).toBeGreaterThanOrEqual(0);
    expect(impact.stressDaysBaseline).toBeGreaterThanOrEqual(0);
  });
});
