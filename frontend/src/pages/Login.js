import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
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
      login(result);
      // Regular users go to dashboard, admins go to admin panel
      navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <form onSubmit={submit} className="card">
        <h1 className="text-3xl font-bold text-navy">Welcome back</h1>
        <p className="mt-2 text-slate-500">Sign in to access predictions and history.</p>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-6">
          <label>Email</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="mt-4">
          <label>Password</label>
          <input
            type="password"
            required
            placeholder="Your password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button disabled={busy} className="btn-primary mt-6 w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-5 text-center text-sm text-slate-500">
          New here? <Link className="font-semibold text-sky" to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
