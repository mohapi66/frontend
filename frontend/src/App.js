import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import StudentDashboard from "./components/dashboards/StudentDashboard";
import LecturerDashboard from "./components/dashboards/LecturerDashboard";
import PrincipalLecturerDashboard from "./components/dashboards/PrincipalLecturerDashboard";
import ProgramLeaderDashboard from "./components/dashboards/ProgramLeaderDashboard";
import LandingPage from "./components/LandingPage";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import "./App.css";

// Dashboard Router Component
function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "Student":
      return <StudentDashboard />;
    case "Lecturer":
      return <LecturerDashboard />;
    case "Principal Lecturer":
      return <PrincipalLecturerDashboard />;
    case "Program Leader":
      return <ProgramLeaderDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;