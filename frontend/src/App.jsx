import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HQLayout from './components/layout/HQLayout.jsx';
import OutletLayout from './components/layout/OutletLayout.jsx';
import Login from './pages/Login.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import Dashboard from './pages/hq/Dashboard.jsx';
import MenuManagement from './pages/hq/MenuManagement.jsx';
import OutletManagement from './pages/hq/OutletManagement.jsx';
import Reports from './pages/hq/Reports.jsx';
import Users from './pages/hq/Users.jsx';
import POS from './pages/outlet/POS.jsx';
import Inventory from './pages/outlet/Inventory.jsx';
import SalesHistory from './pages/outlet/SalesHistory.jsx';
import ForbiddenModal from './components/ui/ForbiddenModal.jsx';
export default function App() {
  return (
    <AuthProvider>
      <ForbiddenModal/>  
      <Routes>

        {/* Public */}
        <Route path="/login"        element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* HQ — admin only */}
        <Route element={
          <ProtectedRoute role="admin">
            <HQLayout />
          </ProtectedRoute>
        }>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/menu"    element={<MenuManagement />} />
          <Route path="/outlets" element={<OutletManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users"   element={<Users />} />
        </Route>

        {/* Outlet — outlet staff (and admin can visit too) */}
        <Route path="/outlet/:id" element={
          <ProtectedRoute>
            <OutletLayout />
          </ProtectedRoute>
        }>
          <Route path="pos"       element={<POS />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales"     element={<SalesHistory />} />
          <Route index            element={<Navigate to="pos" replace />} />
        </Route>

        {/* Redirect root to login if not matched */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
      
    </AuthProvider>
  );
}
