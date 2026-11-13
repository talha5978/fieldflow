import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
            <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🌾</span>
                        <span className="text-xl font-bold tracking-tight text-emerald-900">
                            FieldFlow
                        </span>
                    </div>
                    <nav className="flex items-center gap-6 text-sm font-medium text-emerald-800">
                        <Link href="/method" className="hover:text-emerald-600">
                            Method
                        </Link>
                        <Link
                            href="/setup"
                            className="rounded-full bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                        >
                            Set up a field
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-16">
                <div className="max-w-2xl">
                    <h1 className="text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
                        Know exactly when — and how much — to irrigate.
                    </h1>
                    <p className="mt-6 text-lg leading-relaxed text-emerald-800/80">
                        FieldFlow uses free weather data and FAO-56 crop-water
                        science to give daily irrigation advice for wheat and
                        maize. Every litre, kilowatt-hour and kilogram of CO₂e
                        is calculated from transparent formulas you can inspect.
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4">
                        <Link
                            href="/setup"
                            className="rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-emerald-700"
                        >
                            Configure your field
                        </Link>
                        <Link
                            href="/impact"
                            className="rounded-full border border-emerald-300 bg-white px-6 py-3 text-base font-semibold text-emerald-800 hover:bg-emerald-50"
                        >
                            View demo season impact
                        </Link>
                    </div>
                </div>

                {/* Impact chain teaser */}
                <div className="mt-20 grid gap-6 sm:grid-cols-3">
                    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                        <div className="text-3xl font-bold text-emerald-700">
                            Litres
                        </div>
                        <p className="mt-2 text-sm text-emerald-800/70">
                            Water saved vs fixed-schedule irrigation
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                        <div className="text-3xl font-bold text-emerald-700">
                            kWh / L
                        </div>
                        <p className="mt-2 text-sm text-emerald-800/70">
                            Pumping energy or diesel avoided
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                        <div className="text-3xl font-bold text-emerald-700">
                            kg CO₂e
                        </div>
                        <p className="mt-2 text-sm text-emerald-800/70">
                            Emissions avoided from reduced pumping
                        </p>
                    </div>
                </div>

                <p className="mt-12 text-center text-sm text-emerald-700/60">
                    Built for Green Shift Hacks · Science from FAO-56 · Weather
                    from Open-Meteo
                </p>
            </main>
        </div>
    );
}
