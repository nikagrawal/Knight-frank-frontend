// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import SurveyLinkCreate from './components/SurveyLinkCreate';
import SurveyLinkList from './components/SurveyLinkList';
import SurveyResponse from './components/SurveyResponse';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const isAuthenticated = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">NPS Survey</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              {!isAuthenticated && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Register</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                </>
              )}
              {isAuthenticated && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/survey-links">Create Survey</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/survey-links/list">Survey List</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link btn" onClick={handleLogout}>Logout</button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/survey-links"
          element={
            <ProtectedRoute>
              <SurveyLinkCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey-links/list"
          element={
            <ProtectedRoute>
              <SurveyLinkList />
            </ProtectedRoute>
          }
        />
        <Route path="/survey-response/:signedToken" element={<SurveyResponse />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;