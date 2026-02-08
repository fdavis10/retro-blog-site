import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Friends from './pages/Friends';
import Messages from './pages/Messages';
import PostDetail from './pages/PostDetail';
import AdminPanel from './pages/AdminPanel';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Search from './pages/Search';
import './styles//App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }
  
  return user ? children : <Navigate to="/guests" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }
  
  if (!user) {
    return <Navigate to="/guests" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />
          <Route path="/guests" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          
          <Route path="/profile/:username" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/profile/edit" element={
            <PrivateRoute>
              <ProfileEdit />
            </PrivateRoute>
          } />
          
          <Route path="/friends" element={
            <PrivateRoute>
              <Friends />
            </PrivateRoute>
          } />
          
          <Route path="/messages" element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          } />
          <Route path="/messages/:conversationId" element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          } />
          <Route path="/messages/new/:username" element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          } />
          
          <Route path="/post/:id" element={
            <PrivateRoute>
              <PostDetail />
            </PrivateRoute>
          } />
          <Route path="/create-post" element={
            <PrivateRoute>
              <CreatePost />
            </PrivateRoute>
          } />
          <Route path="/post/:id/edit" element={
            <PrivateRoute>
              <EditPost />
            </PrivateRoute>
          } />
          <Route path="/search" element={
            <PrivateRoute>
              <Search />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;