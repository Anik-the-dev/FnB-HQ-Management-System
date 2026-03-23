import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // if (role && user.role !== role && !(role === 'any')) {
  //   if (user.role !== 'admin') return <Navigate to="/unauthorized" replace />;
  // }
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // if (outletId && user.role === 'outlet' && user.outlet_id !== parseInt(outletId)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return children;
}
