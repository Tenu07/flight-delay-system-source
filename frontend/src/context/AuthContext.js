import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('flight_delay_token')));
  useEffect(() => {
    if (!localStorage.getItem('flight_delay_token')) return;
    api.get('/auth/me').then(setUser).catch(() => localStorage.removeItem('flight_delay_token')).finally(() => setLoading(false));
  }, []);
  const authenticate = (result) => { localStorage.setItem('flight_delay_token', result.token); setUser(result.user); };
  const logout = async () => { try { await api.post('/auth/logout'); } finally { localStorage.removeItem('flight_delay_token'); setUser(null); } };
  const value = useMemo(() => ({ user, loading, login: authenticate, logout, setUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
