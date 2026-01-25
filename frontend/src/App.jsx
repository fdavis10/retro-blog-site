import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AdminPanel from './pages/AdminPanel';
import './styles/App.css';

// Компонент для защищенных маршрутов
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Компонент для маршрутов только для админов
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return isAdmin ? children : <Navigate to="/" />;
};

// Компонент для маршрутов только для суперпользователей
const SuperuserRoute = ({ children }) => {
  const { isSuperuser, loading } = useAuth();

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return isSuperuser ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/create-post" 
        element={
          <AdminRoute>
            <CreatePost />
          </AdminRoute>
        } 
      />

      <Route 
        path="/post/:id" 
        element={
          <PrivateRoute>
            <PostDetail />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/profile/:username" 
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/profile/edit" 
        element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/admin" 
        element={
          <SuperuserRoute>
            <AdminPanel />
          </SuperuserRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;