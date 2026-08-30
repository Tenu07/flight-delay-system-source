import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password.trim(),
      });
      if (result.user?.role !== 'admin') {
        setError('Access denied. This portal is for administrators only.');
        return;
      }
      login(result);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* Header badge */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-white shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-navy">Administrator Login</h1>
          <p className="mt-2 text-slate-500">Restricted access — authorised personnel only.</p>
        </div>

        <form onSubmit={submit} className="card border-2 border-navy/10">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="mt-2">
            <label className="font-semibold text-navy">Admin Email</label>
            <input
              type="email"
              required
              placeholder="admin@flightsignal.ai"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="mt-4">
            <label className="font-semibold text-navy">Password</label>
            <input
              type="password"
              required
              placeholder="Enter admin password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="mt-1"
            />
          </div>

          <button
            disabled={busy}
            className="btn-primary mt-6 w-full"
            style={{ background: 'linear-gradient(135deg, #0f2c5c, #1a56db)' }}
          >
            {busy ? 'Verifying…' : 'Access Admin Dashboard'}
          </button>

          <p className="mt-5 text-center text-xs text-slate-400">
            Not an admin? <a href="/login" className="text-sky hover:underline">Return to user login</a>
          </p>
        </form>

        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 text-center">
          🔒 All admin actions are logged and audited.
        </div>
      </div>
    </div>
  );
}
