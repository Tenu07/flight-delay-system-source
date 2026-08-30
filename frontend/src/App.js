import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import History from './pages/History';
import Analysis from './pages/Analysis';
import Profile from './pages/Profile';
import Feedback from './pages/Feedback';
import Admin from './pages/Admin';
import AdminUsers from './pages/AdminUsers';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Dedicated admin-only login page */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected routes for logged-in users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/history" element={<History />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feedback" element={<Feedback />} />
        </Route>

        {/* Protected routes for admins only */}
        <Route element={<ProtectedRoute admin />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={
          <div className="mx-auto max-w-4xl px-6 py-24 text-center">
            <h1 className="page-title">Page not found</h1>
          </div>
        } />
      </Route>
    </Routes>
  );
}
