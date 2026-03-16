import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const goHome = () => {
    if (!user) navigate('/login');
    else if (user.role === 'admin') navigate('/');
    else navigate(`/outlet/${user.outlet_id}/pos`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Access denied</h1>
        <p className="text-sm text-gray-400 mb-6">You don't have permission to view this page.</p>
        <button
          onClick={goHome}
          className="bg-blue-700 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors"
        >
          Go to my dashboard
        </button>
      </div>
    </div>
  );
}
