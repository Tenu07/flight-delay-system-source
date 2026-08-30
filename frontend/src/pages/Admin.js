import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Admin() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(setData);
  }, []);

  if (!data) return <div className="p-16 text-center">Loading admin analytics…</div>;

  const metrics = data.modelMetrics || {};

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <p className="font-semibold text-sky">ADMINISTRATION</p>
      <h1 className="page-title mt-1">System Overview</h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Users', data.totalUsers],
          ['All predictions', data.totalPredictions],
          ['Today', data.predictionsToday],
          ['Past 7 days', data.predictionsWeek],
          ['Feedback rating', data.avgFeedbackRating ? `${data.avgFeedbackRating} / 5` : 'N/A'],
        ].map(([label, value]) => (
          <div className="card" key={label}>
            <p className="text-3xl font-extrabold text-navy">{value ?? 0}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <section className="card mt-8">
        <h2 className="text-xl font-bold text-navy">Model Performance Metrics</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-5">
          {[
            ['AUC-ROC', metrics.auc_roc],
            ['F1 Score', metrics.f1],
            ['Precision', metrics.precision],
            ['Recall', metrics.recall],
            ['Accuracy', metrics.accuracy],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-2xl font-extrabold text-navy">{value ?? '—'}</p>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-8">
        <h2 className="text-xl font-bold text-navy">Recent Prediction Activity</h2>
        <div className="mt-4 divide-y">
          {(data.recentActivity || []).length === 0 ? (
            <p className="py-4 text-sm text-slate-400">No predictions recorded yet.</p>
          ) : (
            (data.recentActivity || []).map(item => (
              <div key={item._id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span>
                  <b>{item.origin} → {item.destination}</b> · {item.userId?.name || 'User'}
                </span>
                <span className="font-semibold text-navy">
                  {item.delayProbability}% · {item.riskCategory}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
