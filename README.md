<div align="center">
  <h1 align="center">FieldFlow 🌾💧</h1>
  <p align="center">
    <strong>A Water-Wise Irrigation Advisor & Impact Calculator for Smallholder Farmers</strong>
  </p>
  <p align="center">
    <em>Rooted in FAO-56 Science • Powered by Free Weather Data • Translating Litres into Energy & Carbon Savings</em>
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-the-science--methodology">Science</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-project-structure">Structure</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-testing">Testing</a>
  </p>
</div>

---

## 🌾 Overview

**FieldFlow** is an open-source, data-driven irrigation management web application built for smallholder farmers and agricultural extension workers. Instead of relying on rigid, traditional irrigation schedules that either underwater crops or waste precious groundwater, FieldFlow calculates exact daily water requirements using real-time weather forecasts and **FAO-56 single-crop-coefficient methodology**.

Every recommendation traces back to transparent, peer-reviewed agronomic formulas, quantifying the complete impact chain:
$$\text{Litres of Water Saved} \longrightarrow \text{Pumping Energy Saved (kWh / Diesel L)} \longrightarrow \text{CO}_2\text{e Emissions Avoided}$$

---

## ✨ Features

- **Daily Smart Recommendations:** Provides actionable daily calls (*"Irrigate 62 mm (25,000 L)"* or *"Skip irrigation, rain expected"*) paired with a 7-day forecast outlook and a dynamic root-zone soil water gauge.
- **FAO-56 Water-Balance Engine:** Pure, zero-I/O calculation engine handling crop evapotranspiration ($\text{ET}_c$), total available water ($\text{TAW}$), readily available water ($\text{RAW}$), effective rainfall ($\text{P}_{\text{eff}}$), and root-zone depletion ($\text{Dr}$).
- **Season Replay & Impact Dashboard:** Compare advised irrigation schedules against traditional fixed-interval baselines across past seasons to visualize cumulative water savings, energy reductions, carbon abatement, and crop stress days.
- **Multilingual Support (English & Urdu):** Full right-to-left (`dir="rtl"`) UI layout support with readable Noto Naskh typography for local farming communities in South Asia.
- **Robust Offline Resilience:** Seamless fallback caching via Open-Meteo historical datasets and committed fixture JSONs ensuring zero downtime during demonstration or network disruptions.

---

## 🔬 The Science & Methodology

FieldFlow strictly implements the **FAO Irrigation and Drainage Paper No. 56** standards:

1. **Crop Water Demand ($\text{ET}_c$):**
   $$\text{ET}_c = K_c \times \text{ET}_0$$
   *(Where $K_c$ interpolates dynamically across initial, mid, and late growth stages for wheat and maize).*

2. **Root-Zone Water Storage:**
   $$\text{TAW} = 1000 \times (\theta_{\text{FC}} - \theta_{\text{WP}}) \times Z_r$$
   $$\text{RAW} = p \times \text{TAW}$$

3. **Daily Depletion & Irrigation Trigger:**
   $$\text{Dr}_{\text{end}}(i) = \text{clamp}(\text{Dr}_{\text{end}}(i-1) - \text{P}_{\text{eff}}(i) - I(i) + \text{ET}_c(i), 0, \text{TAW})$$
   - **Trigger:** Irrigate when $\text{Dr} + \text{ET}_{c,\text{today}} - \text{P}_{\text{eff,forecast}} \ge \text{RAW}$.
   - **Net Depth:** $\text{Dr}$ (refilling precisely to field capacity).
   - **Gross Depth:** $\text{Net} / E_a$ (where $E_a$ is application efficiency, default $0.6$ for surface/flood irrigation).

4. **Energy & Carbon Conversion:**
   - **Electric Tubewells:** $\text{kWh} = \frac{0.00272 \times m^3 \times H}{\eta}$ $\rightarrow$ $\text{kg CO}_2\text{e} = \text{kWh} \times \text{Grid EF}$
   - **Diesel Tubewells:** Litres = Shaft energy divided by engine output efficiency constant.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js (App Router) + TypeScript | Type-safe server and client routing |
| **Styling & UI** | Tailwind CSS, Shadcn UI, Recharts | Accessible components & interactive impact charts |
| **Validation** | Zod | Runtime schema validation for weather and field configs |
| **Testing** | Vitest | Rigorous invariant testing of the water-balance engine |
| **Database** | Supabase / LocalStorage | Persistent field configurations and state management |
| **Deployment** | Vercel | Global edge hosting |

---

## 📂 Project Structure

```text
src/
  lib/engine/            # Pure functions, zero I/O, fully unit-tested
    types.ts             # Core interfaces (FieldConfig, DayWeather, DayResult)
    constants.ts         # Kc tables, soil parameters, emission factors with sources
    waterBalance.ts      # stepDay(), recommend()
    simulate.ts          # Season replay: advised vs. baseline
    impact.ts            # m³ → kWh → kg CO₂e calculations
  lib/weather/           # Open-Meteo client, Zod parsers, and caching logic
  app/
    page.tsx             # Landing page & one-click demo season
    setup/               # Field configuration wizard
    field/[id]/          # Today's call, 7-day plan, & soil-water gauge
    impact/              # Cumulative replay comparison & savings charts
    method/              # Scientific formulas, data sources, and limitations
    api/                 # API routes for recommendations, simulation, & AI explainers
```
## 🚀 Getting Started
### Prerequisites
- Node.js 18.x or higher
- pnpm (recommended) or npm
### Installation
1. Clone the repository:
```bash
git clone https://github.com/talha5978/fieldflow.git
cd fieldflow
```
2. Install dependencies:
```bash
pnpm install
```
3. Run the development server:
```bash
pnpm dev
```
4. Open your browser:
Navigate to http://localhost:3000.🧪
## Testing
The calculation engine is 100% pure TypeScript with zero side effects, backed by comprehensive Vitest test suites verifying physical invariants:
- Depletion remains strictly clamped within $[0, \text{TAW}]$.
- Water balance conservation (inputs minus outputs equal net storage change).
- Heavy precipitation suppression and zero-ET₀ handling.Canal water source correctly yields zero pumping energy and carbon emissions.
- Run tests using:
```bash
pnpm test
```
## 📜 License
Distributed under the MIT License. See LICENSE for more information.