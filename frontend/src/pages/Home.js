import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CloudSun, Search, Zap, Shield, Plane } from 'lucide-react';

export default function Home() {
  const steps = [
    {
      number: '01',
      emoji: '✈️',
      icon: Plane,
      color: '#2563eb', // Blue
      bgColor: '#eff6ff', // Light Blue
      borderColor: '#bfdbfe',
      title: 'Enter your flight',
      body: 'Choose your route, carrier, departure date, and scheduled time.',
    },
    {
      number: '02',
      emoji: '⛅',
      icon: CloudSun,
      color: '#0284c7', // Sky
      bgColor: '#f0f9ff', // Light Sky
      borderColor: '#bae6fd',
      title: 'Add live conditions',
      body: 'Live weather and origin airport conditions are gathered automatically.',
    },
    {
      number: '03',
      emoji: '⚡',
      icon: Zap,
      color: '#d97706', // Amber
      bgColor: '#fffbeb', // Light Amber
      borderColor: '#fde68a',
      title: 'Run the model',
      body: 'Calculates the real probability of a 15+ minute arrival delay.',
    },
    {
      number: '04',
      emoji: '📊',
      icon: BarChart3,
      color: '#059669', // Emerald
      bgColor: '#ecfdf5', // Light Emerald
      borderColor: '#a7f3d0',
      title: 'Understand the result',
      body: 'Inspect key delay drivers, risk gauge, and actionable explanations.',
    },
  ];

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Full-bleed background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/flight-hero.jpg')" }}
        />
        {/* Dark gradient overlay for maximum readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0f2044]/80 to-[#0a1628]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-transparent to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur-md">
              <Shield size={16} className="text-sky" />
              Pre-departure Flight Intelligence
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Know the delay
              <br />
              <span className="bg-gradient-to-r from-sky via-blue-200 to-white bg-clip-text text-transparent">
                before you fly.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100/90">
              FlightSignal evaluates historical airline performance, airport congestion, and live weather conditions to give you an accurate delay probability.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-navy shadow-lg shadow-black/30 transition-all duration-200 hover:bg-blue-50 hover:scale-105"
              >
                Check a flight <ArrowRight size={18} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade into background */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#f4f7fb] to-transparent" />
      </section>

      {/* ── STATS STRIP ── */}
      <section className="relative z-20 -mt-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 rounded-3xl border border-slate-200/80 bg-white p-2 shadow-panel">
          {[
            ['70M+', 'BTS flight records analyzed'],
            ['20', 'Major US hubs covered'],
            ['Top 5', 'Risk factors explained per flight'],
          ].map(([stat, label]) => (
            <div key={label} className="px-8 py-6 text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-navy">{stat}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOUR CLEAR STEPS (WITH VIBRANT EMOJIS & ICON BOXES) ── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-sky">Simple 4-Step Process</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy">From flight details to useful insight</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Our pipeline calculates delay risk and explains what factors are driving the prediction.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
              >
                <div>
                  {/* Top Header: Emoji + Number */}
                  <div className="flex items-center justify-between">
                    {/* Emoji + Icon Box */}
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: step.bgColor,
                        borderColor: step.borderColor,
                      }}
                    >
                      <span className="text-2xl select-none" role="img" aria-label={step.title}>
                        {step.emoji}
                      </span>
                    </div>

                    {/* Step Number Badge */}
                    <span
                      className="rounded-full px-3 py-1 text-xs font-extrabold tracking-wider"
                      style={{
                        color: step.color,
                        backgroundColor: step.bgColor,
                      }}
                    >
                      STEP {step.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-6 text-xl font-bold text-navy flex items-center gap-2">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.body}
                  </p>
                </div>

                {/* Bottom decorative bar */}
                <div
                  className="mt-6 h-1 w-12 rounded-full transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: step.color }}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ── */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-8 py-16 text-center text-white shadow-panel">
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-slate-900 to-navy opacity-90" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to check your flight?</h2>
            <p className="mx-auto mt-4 max-w-lg text-blue-200">
              Create a free account to get live delay probabilities, view historical route trends, and save your flights.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-navy shadow-lg transition-all duration-200 hover:bg-blue-50 hover:scale-105"
            >
              Get started — it's free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
