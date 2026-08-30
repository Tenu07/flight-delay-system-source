import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Plane, LogOut, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-blue-50 text-sky' : 'text-slate-600 hover:text-navy hover:bg-slate-50'
  }`;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = user
    ? [
        ['Dashboard', '/dashboard'],
        ['Predict', '/predict'],
        ['History', '/history'],
        ['Route analysis', '/analysis'],
        ['Feedback', '/feedback'],
        ['Profile', '/profile'],
      ]
    : [
        ['Home', '/'],
        ['About', '/about'],
      ];

  if (user?.role === 'admin') {
    links.push(['Admin', '/admin'], ['Users', '/admin/users']);
  }

  const signOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-navy text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-white shadow-sm">
              <Plane size={20} />
            </span>
            FlightSignal
          </Link>

          <button className="sm:hidden text-slate-700" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className="hidden items-center gap-1 sm:flex">
            {links.map(([label, to]) => (
              <NavLink key={to} to={to} className={linkClass}>
                {label}
              </NavLink>
            ))}
            {user ? (
              <button onClick={signOut} className="btn-secondary ml-2 py-2 text-sm">
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary ml-2 py-2 text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 text-sm shadow-sm">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>

        {open && (
          <nav className="grid gap-1 border-t bg-white p-4 sm:hidden shadow-lg">
            {links.map(([label, to]) => (
              <NavLink
                onClick={() => setOpen(false)}
                key={to}
                to={to}
                className={linkClass}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy">FlightSignal</span>
            <span>— flight delay decision support</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Accurate pre-departure risk intelligence</span>
            <Link
              to="/admin-login"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-navy transition"
              title="Administrator Portal"
            >
              <Shield size={12} />
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
