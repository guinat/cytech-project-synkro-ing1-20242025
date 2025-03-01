import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

import Header from '@/components/Header';
import AuthRedirect from '@/components/AuthRedirect';
import ProtectedRoute from '@/components/ProtectedRoute';

import Home from '@/pages/Home';
import Debug from '@/pages/Debug';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Logout from '@/pages/Logout';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/login" element={
            <AuthRedirect title="Login">
              <Login />
            </AuthRedirect>
          } />
          <Route path="/register" element={
            <AuthRedirect title="Register">
              <Register />
            </AuthRedirect>
          } />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/debug"
            element={
              <ProtectedRoute>
                <Debug />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Home />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;