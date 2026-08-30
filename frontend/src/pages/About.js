export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="font-semibold text-sky">ABOUT FLIGHTSIGNAL</p>
      <h1 className="page-title mt-2">Clear, reliable flight delay intelligence</h1>
      
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="text-xl font-bold text-navy">Purpose</h2>
          <p className="mt-3 leading-7 text-slate-600">
            FlightSignal predicts whether a US domestic flight will experience departure and arrival delays. It provides travelers and aviation analysts with clear probability assessments before departure.
          </p>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-navy">Data & Analytics</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Our pipeline evaluates BTS On-Time Performance history, airport traffic conditions, carrier reliability, and live origin weather to compute accurate risk scores and actionable factor breakdowns.
          </p>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-navy">Core Features</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Real-time flight risk gauge, key risk drivers breakdown, route and carrier comparison analytics, historical prediction tracking, and dedicated administrator tools.
          </p>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-navy">Privacy & Security</h2>
          <p className="mt-3 leading-7 text-slate-600">
            User credentials are secure and encrypted. Prediction history is saved privately to your account with full role-based access control.
          </p>
        </section>
      </div>
    </div>
  );
}
