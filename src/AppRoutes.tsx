import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Login from './screens/Login';
import Signup from './screens/Signup';
import MHome from './screens/MuseumHome';
import IHome from './screens/Home';

// Function to check if token is expired
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  try {
    // Get payload from JWT token
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if token is expired
    return payload.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};

const PrivateRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Check if token is expired or missing
  if (!token || isTokenExpired(token)) {
    console.log('Redirecting to login because token is expired or missing');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  console.log('Checking authentication:', token ? 'Token exists' : 'No token');
  console.log('User role:', user.role);

  if (requiredRole && user.role !== requiredRole) {
    console.log('Redirecting due to insufficient role');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  // Check token expiration on initial load and setup periodic check
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && isTokenExpired(token)) {
      console.log('Token expired on initial load, clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Set up periodic token expiration check
    const checkTokenInterval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && isTokenExpired(currentToken)) {
        console.log('Token expired during interval check, clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        clearInterval(checkTokenInterval);
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(checkTokenInterval);
    };
  }, []);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isValidToken = token && !isTokenExpired(token);

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
          isValidToken ? (
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
          <div className="min-h-screen flex items-center justify-center gradient-mesh">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-12 glass rounded-3xl"
            >
              <h1 className="text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500 mb-4">404</h1>
              <p className="text-xl text-muted-foreground mb-8 font-medium">Lost in Time?</p>
              <Link
                to="/"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Return to Present
              </Link>
            </motion.div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default AppRoutes;