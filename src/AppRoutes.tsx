// AppRoutes.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './screens/Login';
import Signup from './screens/Signup';
import MHome from './screens/MuseumHome';
import IHome from './screens/Home';

const PrivateRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const isAuthenticated = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('Checking authentication:', isAuthenticated);
  console.log('User role:', user.role);

  if (!isAuthenticated) {
    console.log('Redirecting to login because not authenticated');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('Redirecting due to insufficient role');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const isAuthenticated = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/museum-home"
          element={
            <PrivateRoute requiredRole="museum">
              <MHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-home"
          element={
            <PrivateRoute requiredRole="individual">
              <IHome />
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={
          isAuthenticated ? (
            user.role === 'museum' ? (
              <Navigate to="/museum-home" replace />
            ) : (
              <Navigate to="/user-home" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center gradient-bg">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <a
                href="/"
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Go back home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default AppRoutes;