import Link from "next/link";

export default function MethodPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-emerald-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-900">
            <span>🌾</span> FieldFlow
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-emerald-950">Method & sources</h1>
        <p className="mt-3 text-lg leading-relaxed text-emerald-800/80">
          Every number shown in FieldFlow traces back to a published formula or
          a clearly stated assumption. This page lists them so judges and users
          can verify the calculations.
        </p>

        {/* Core equations */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-emerald-900">
            Core water-balance equations (FAO-56)
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-950">
{`ETc  = Kc × ET0                         // crop water demand (mm/day)
TAW  = 1000 × (θFC − θWP) × Zr          // total available water (mm)
RAW  = p × TAW                          // readily available water (mm)

Dr_end(i) = clamp(
  Dr_end(i−1) − Peff(i) − I(i) + ETc(i),
  0, TAW
)`}
          </pre>

          <h3 className="mt-6 text-base font-semibold text-emerald-900">
            Irrigation decision rule
          </h3>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-950">
{`Irrigate if  Dr + ETc_today − Peff_forecast ≥ RAW
Net depth   = Dr          // refill to field capacity
Gross depth = net / Ea    // Ea = application efficiency (default 0.6)`}
          </pre>
        </section>

        {/* Kc table */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-emerald-900">
            Crop coefficients (Kc) and stage lengths
          </h2>
          <p className="mt-2 text-sm text-emerald-800/70">
            Approximate single-crop-coefficient values from{" "}
            <strong>FAO-56 Tables 11 &amp; 12</strong>.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-200 text-emerald-700">
                  <th className="py-2 pr-4">Crop</th>
                  <th className="py-2 pr-4">Initial</th>
                  <th className="py-2 pr-4">Development</th>
                  <th className="py-2 pr-4">Mid-season</th>
                  <th className="py-2">Late</th>
                </tr>
              </thead>
              <tbody className="text-emerald-900">
                <tr className="border-b border-emerald-50">
                  <td className="py-3 pr-4 font-medium">Wheat</td>
                  <td className="py-3 pr-4">Kc 0.30 · 30 d</td>
                  <td className="py-3 pr-4">Kc ≈ 0.70 · 40 d</td>
                  <td className="py-3 pr-4">Kc 1.15 · 50 d</td>
                  <td className="py-3">Kc 0.25 · 30 d</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Maize</td>
                  <td className="py-3 pr-4">Kc 0.30 · 25 d</td>
                  <td className="py-3 pr-4">Kc ≈ 0.75 · 40 d</td>
                  <td className="py-3 pr-4">Kc 1.20 · 50 d</td>
                  <td className="py-3">Kc 0.60 · 30 d</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Soil parameters */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-emerald-900">Soil parameters</h2>
          <p className="mt-2 text-sm text-emerald-800/70">
            θFC − θWP from <strong>FAO-56 Table 19</strong>; depletion fraction p
            and root depth Zr from <strong>Table 22</strong> (typical cereal
            values).
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-200 text-emerald-700">
                  <th className="py-2 pr-4">Soil</th>
                  <th className="py-2 pr-4">θFC − θWP</th>
                  <th className="py-2 pr-4">p</th>
                  <th className="py-2 pr-4">Zr (m)</th>
                  <th className="py-2">TAW (mm)</th>
                </tr>
              </thead>
              <tbody className="text-emerald-900">
                <tr className="border-b border-emerald-50">
                  <td className="py-3 pr-4 font-medium">Sandy loam</td>
                  <td className="py-3 pr-4">0.12</td>
                  <td className="py-3 pr-4">0.55</td>
                  <td className="py-3 pr-4">1.0</td>
                  <td className="py-3">120</td>
                </tr>
                <tr className="border-b border-emerald-50">
                  <td className="py-3 pr-4 font-medium">Loam</td>
                  <td className="py-3 pr-4">0.15</td>
                  <td className="py-3 pr-4">0.55</td>
                  <td className="py-3 pr-4">1.2</td>
                  <td className="py-3">180</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Clay loam</td>
                  <td className="py-3 pr-4">0.18</td>
                  <td className="py-3 pr-4">0.50</td>
                  <td className="py-3 pr-4">1.0</td>
                  <td className="py-3">180</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-emerald-700/60">
            TAW = 1000 × (θFC − θWP) × Zr. RAW = p × TAW.
          </p>
        </section>

        {/* Effective rainfall */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-emerald-900">
            Effective rainfall (stated assumption)
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-900">
            <li>Events under <strong>5 mm</strong> are ignored</li>
            <li>
              <strong>80 %</strong> of the remainder is considered effective
            </li>
            <li>Capped by current root-zone storage capacity (cannot exceed Dr + ETc)</li>
          </ul>
        </section>

        {/* Energy & emissions */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-emerald-900">
            Energy and emissions
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-950">
{`kWh = 0.00272 × m³ × H / η
Diesel litres = kWh / 3.2               // labelled constant
CO₂e (electric) = kWh × 0.50 kg/kWh     // Pakistan grid approx.
CO₂e (diesel)   = litres × 2.68 kg/L    // IPCC / DEFRA typical`}
          </pre>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-emerald-900">
            <li>
              Default total dynamic head H = <strong>30 m</strong> (shallow
              tubewell)
            </li>
            <li>
              Default wire-to-water efficiency η = <strong>0.55</strong>
            </li>
            <li>
              Canal source skips the energy and CO₂ steps entirely (no pumping)
            </li>
          </ul>
        </section>

        {/* Baseline sensitivity */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-emerald-900">
            Baseline comparison & sensitivity
          </h2>
          <p className="mt-2 text-sm text-emerald-800/70">
            The fixed-schedule baseline is the counterfactual we compare against.
            Default values are representative of common extension practice in
            irrigated areas of Pakistan. On the Impact page you can switch
            between three scenarios:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-200 text-emerald-700">
                  <th className="py-2 pr-4">Scenario</th>
                  <th className="py-2 pr-4">Interval</th>
                  <th className="py-2 pr-4">Net depth</th>
                  <th className="py-2">Notes</th>
                </tr>
              </thead>
              <tbody className="text-emerald-900">
                <tr className="border-b border-emerald-50">
                  <td className="py-3 pr-4 font-medium">Conservative</td>
                  <td className="py-3 pr-4">18 days</td>
                  <td className="py-3 pr-4">50 mm</td>
                  <td className="py-3">Lower water use, higher stress risk</td>
                </tr>
                <tr className="border-b border-emerald-50">
                  <td className="py-3 pr-4 font-medium">Typical (default)</td>
                  <td className="py-3 pr-4">14 days</td>
                  <td className="py-3 pr-4">60 mm</td>
                  <td className="py-3">Common extension recommendation</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Wasteful</td>
                  <td className="py-3 pr-4">10 days</td>
                  <td className="py-3 pr-4">70 mm</td>
                  <td className="py-3">Over-irrigation common in practice</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-emerald-800/70">
            Maize defaults: 12-day interval, 55 mm net. Showing stress days for
            both schedules makes the savings claim more credible — the baseline
            sometimes under-waters as well as over-waters.
          </p>
        </section>

        {/* Data sources */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-emerald-900">Data sources</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-emerald-900">
            <li>
              <strong>Weather</strong> — Open-Meteo forecast &amp; archive APIs
              (daily ET₀ FAO and precipitation_sum). Free, no API key.
              Server-side cache ~3 h + committed deterministic fallback season
              so the demo never breaks.
            </li>
            <li>
              <strong>Science</strong> — Allen et al., FAO Irrigation and
              Drainage Paper 56 (1998).
            </li>
            <li>
              <strong>Emission factors</strong> — Pakistan grid ≈ 0.50 kg
              CO₂e/kWh (Ember / national inventories); diesel 2.68 kg CO₂e/L
              (IPCC / DEFRA).
            </li>
          </ul>
        </section>

        {/* Limitations */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-emerald-900">
            Limitations (stated honestly)
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-emerald-900">
            <li>
              Simplified single-layer soil bucket; no capillary rise or deep
              percolation beyond TAW.
            </li>
            <li>No local soil-sensor calibration.</li>
            <li>
              Kc values are approximate mid-latitude single coefficients; local
              varieties and management may differ.
            </li>
            <li>
              Rice (flooded paddies) is excluded because the soil-bucket model
              does not apply.
            </li>
            <li>
              Emission factors are national / IPCC defaults, not site-specific.
            </li>
            <li>
              All savings are <em>estimated</em> relative to the stated baseline
              scenario.
            </li>
          </ul>
        </section>

        <p className="mt-14 text-center text-sm text-emerald-700/60">
          Built for Green Shift Hacks · Verify every constant against the
          primary sources before final submission.
        </p>
      </main>
    </div>
  );
}
