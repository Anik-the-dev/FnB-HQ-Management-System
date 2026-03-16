import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/',        label: 'Dashboard' },
  { to: '/menu',    label: 'Menu' },
  { to: '/outlets', label: 'Outlets' },
  { to: '/reports', label: 'Reports' },
  { to: '/users',   label: 'Users' },
];

export default function HQLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-lg tracking-tight">FnB HQ</span>
          <div className="flex gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-blue-200 hover:text-white hover:bg-blue-600/50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-blue-200">
            {user?.username} <span className="text-blue-400">({user?.role})</span>
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs text-blue-200 hover:text-white bg-blue-600/40 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors"
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
