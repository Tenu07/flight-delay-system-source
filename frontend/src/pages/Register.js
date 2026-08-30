import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setBusy(true); setError('');
    try {
      const result = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'user',
      });
      login(result);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <form onSubmit={submit} className="card">
        <h1 className="text-3xl font-bold text-navy">Create your account</h1>
        <p className="mt-2 text-slate-500">Save, compare, and revisit your predictions.</p>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {[['name','Full name','text'],['email','Email','email'],['password','Password (8+ characters)','password'],['confirm','Confirm password','password']].map(([key, label, type]) => (
          <div className="mt-4" key={key}>
            <label>{label}</label>
            <input required minLength={type === 'password' ? 8 : undefined} type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
          </div>
        ))}
        <button disabled={busy} className="btn-primary mt-6 w-full">{busy ? 'Creating…' : 'Create account'}</button>
        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered? <Link className="font-semibold text-sky" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
