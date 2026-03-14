import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// role: 'admin' | 'outlet' | undefined (any authenticated)
// outletId: if provided, outlet user must own this outlet
export default function ProtectedRoute({ children, role, outletId }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role && !(role === 'any')) {
    // admin can access everything; outlet is restricted
    if (user.role !== 'admin') return <Navigate to="/unauthorized" replace />;
  }

  if (outletId && user.role === 'outlet' && user.outlet_id !== parseInt(outletId)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
