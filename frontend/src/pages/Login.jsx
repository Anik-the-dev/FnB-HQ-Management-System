import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWaitWarning, setShowWaitWarning] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Enter username and password.'); return; }
    setLoading(true);
    setShowWaitWarning(true);
    setError('');
    try {
      const res = await login(form);
      const { token, user } = res.data.data;
      signIn(token, user);
      if (user.role === 'admin') navigate('/');
      else navigate(`/outlet/${user.outlet_id}/pos`);
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
      setShowWaitWarning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">FnB HQ System</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to continue</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {showWaitWarning && (
              <p className="text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
                Please wait 30sec to activate the free tier server...
              </p>
            )}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Username</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="admin / outlet1 / outlet2 / outlet3"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Password</label>
              <input
                type="password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="password123"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white text-sm py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
