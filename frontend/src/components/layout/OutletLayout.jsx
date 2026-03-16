import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getOutlet } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function OutletLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [name, setName] = useState('Outlet');

  useEffect(() => {
    getOutlet(id).then((r) => setName(r.data.data.name)).catch(() => {});
  }, [id]);

  const links = [
    { to: `/outlet/${id}/pos`,       label: 'POS' },
    { to: `/outlet/${id}/inventory`, label: 'Inventory' },
    { to: `/outlet/${id}/sales`,     label: 'Sales' },
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-teal-700 text-white px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/')}
                className="text-teal-300 hover:text-white text-sm transition-colors"
              >
                ← HQ
              </button>
            )}
            <span className="font-semibold text-lg tracking-tight">{name}</span>
          </div>
          <div className="flex gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-teal-600 text-white' : 'text-teal-200 hover:text-white hover:bg-teal-600/50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-teal-200">
            {user?.username} <span className="text-teal-400">({user?.role})</span>
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs text-teal-200 hover:text-white bg-teal-600/40 hover:bg-teal-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>
      <main className="p-6 max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
