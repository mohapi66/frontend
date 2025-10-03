import React from "react";
import { Link } from "react-router-dom";
import "./styles/LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="brand">EduPlatform</span>
          </h1>
          <p className="hero-subtitle">
            Join thousands of students and educators in a seamless learning experience. 
            Manage your academic journey with ease and efficiency.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-button primary">
              Get Started
            </Link>
            <Link to="/login" className="cta-button secondary">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card card-1">
            <div className="card-icon">🎓</div>
            <h4>Academic Excellence</h4>
            <p>Quality education for everyone</p>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">👥</div>
            <h4>Collaborative Learning</h4>
            <p>Learn and grow together</p>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">📚</div>
            <h4>Rich Resources</h4>
            <p>Access to extensive materials</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose EduPlatform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast & Efficient</h3>
              <p>Streamlined processes for managing courses, assignments, and communication.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Reliable</h3>
              <p>Your data is protected with enterprise-grade security measures.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Accessible Anywhere</h3>
              <p>Access your courses and materials from any device, anywhere.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Analytics</h3>
              <p>Track progress and performance with detailed insights.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Seamless Communication</h3>
              <p>Connect with educators and peers effortlessly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Regular Updates</h3>
              <p>Always improving with new features and enhancements.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <h3>10,000+</h3>
              <p>Active Students</p>
            </div>
            <div className="stat">
              <h3>500+</h3>
              <p>Expert Educators</p>
            </div>
            <div className="stat">
              <h3>50+</h3>
              <p>Programs Offered</p>
            </div>
            <div className="stat">
              <h3>99%</h3>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role-based Sections */}
      <div className="roles-section">
        <div className="container">
          <h2 className="section-title">Designed for Every Role</h2>
          <div className="roles-grid">
            <div className="role-card">
              <div className="role-icon">👨‍🎓</div>
              <h3>Students</h3>
              <ul>
                <li>Monitor lecture reports</li>
                <li>Rate teaching quality</li>
                <li>Track academic progress</li>
                <li>Access learning materials</li>
              </ul>
            </div>
            <div className="role-card">
              <div className="role-icon">👨‍🏫</div>
              <h3>Lecturers</h3>
              <ul>
                <li>Submit lecture reports</li>
                <li>Manage classes</li>
                <li>Receive feedback</li>
                <li>Track attendance</li>
              </ul>
            </div>
            <div className="role-card">
              <div className="role-icon">👨‍💼</div>
              <h3>Principal Lecturers</h3>
              <ul>
                <li>Review reports</li>
                <li>Provide feedback</li>
                <li>Monitor courses</li>
                <li>Quality assurance</li>
              </ul>
            </div>
            <div className="role-card">
              <div className="role-icon">👨‍💻</div>
              <h3>Program Leaders</h3>
              <ul>
                <li>Manage courses</li>
                <li>Assign modules</li>
                <li>Oversee programs</li>
                <li>Analytics & reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Educational Experience?</h2>
            <p>Join thousands of users who are already benefiting from our platform.</p>
            <div className="cta-buttons">
              <Link to="/signup" className="cta-button primary large">
                Start Your Journey
              </Link>
              <Link to="/login" className="cta-button secondary large">
                Access Your Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;