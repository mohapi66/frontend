import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./styles/styles.css";

const Signup = () => {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    role_id: "", 
    faculty_id: "", 
    program_id: "" 
  });
  
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '' });

  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  // Hardcoded faculties and programs data
  const facultiesData = [
    { id: 1, name: "Business" },
    { id: 2, name: "Computer" },
    { id: 3, name: "Design" },
    { id: 4, name: "Tourism" }
  ];

  const programsData = {
    1: [ // Business
      { id: 6, name: "International Business" },
      { id: 7, name: "Business Management" }
    ],
    2: [ // Computer
      { id: 1, name: "Software Engineering" },
      { id: 2, name: "BSc in IT" },
      { id: 3, name: "IT" }
    ],
    3: [ // Design
      { id: 4, name: "Graphics Design" },
      { id: 5, name: "Architecture" }
    ],
    4: [ // Tourism
      { id: 8, name: "Hotel Management" },
      { id: 9, name: "Tourism Management" }
    ]
  };

  useEffect(() => {
    setFaculties(facultiesData);
    calculatePasswordStrength(formData.password);
  }, [formData.password]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengthMap = {
      0: { text: 'Very weak', class: 'strength-weak' },
      1: { text: 'Weak', class: 'strength-weak' },
      2: { text: 'Medium', class: 'strength-medium' },
      3: { text: 'Strong', class: 'strength-strong' },
      4: { text: 'Very strong', class: 'strength-strong' }
    };

    setPasswordStrength({
      score,
      ...strengthMap[score] || { text: '', class: '' }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.role_id) {
      newErrors.role_id = "Please select a role";
    }
    
    if (formData.role_id === "4") {
      if (!formData.faculty_id) {
        newErrors.faculty_id = "Please select a faculty";
      }
      if (!formData.program_id) {
        newErrors.program_id = "Please select a program";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFacultyChange = (e) => {
    const facultyId = e.target.value;
    setFormData({ ...formData, faculty_id: facultyId, program_id: "" });
    setErrors(prev => ({ ...prev, faculty_id: "", program_id: "" }));
    
    if (facultyId) {
      const facultyPrograms = programsData[facultyId] || [];
      setPrograms(facultyPrograms);
    } else {
      setPrograms([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...submitData } = formData;
    const result = await signup(submitData);
    
    if (result.success) {
      alert("Registration Successful! You can now login.");
      navigate('/login');
    } else {
      setErrors({ submit: result.error });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🎓</span>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join our educational platform today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className={`form-input ${errors.name ? 'error shake' : ''}`}
              placeholder="Enter your full name" 
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)} 
              required 
            />
            {errors.name && (
              <div className="error-message">⚠️ {errors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className={`form-input ${errors.email ? 'error shake' : ''}`}
              placeholder="Enter your email" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)} 
              required 
            />
            {errors.email && (
              <div className="error-message">⚠️ {errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-container">
              <input 
                type={showPassword ? "text" : "password"} 
                className={`form-input ${errors.password ? 'error shake' : ''}`}
                placeholder="Create a password" 
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)} 
                required 
              />
              <button 
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className={`strength-fill ${passwordStrength.class}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  ></div>
                </div>
                <div className="strength-text">Strength: {passwordStrength.text}</div>
              </div>
            )}
            {errors.password && (
              <div className="error-message">⚠️ {errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input 
              type="password" 
              className={`form-input ${errors.confirmPassword ? 'error shake' : ''}`}
              placeholder="Confirm your password" 
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)} 
              required 
            />
            {errors.confirmPassword && (
              <div className="error-message">⚠️ {errors.confirmPassword}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select 
              className={`form-select ${errors.role_id ? 'error shake' : ''}`}
              value={formData.role_id}
              onChange={(e) => handleInputChange('role_id', e.target.value)}
            >
              <option value="">Select your role</option>
              <option value="1">Lecturer</option>
              <option value="2">Program Leader</option>
              <option value="3">Principal Lecturer</option>
              <option value="4">Student</option>
            </select>
            {errors.role_id && (
              <div className="error-message">⚠️ {errors.role_id}</div>
            )}
          </div>

          {formData.role_id === "4" && (
            <div className="conditional-fields">
              <h3 style={{ marginBottom: '20px', color: '#374151' }}>Student Information</h3>
              
              <div className="field-group">
                <label className="form-label">Faculty</label>
                <select 
                  className={`form-select ${errors.faculty_id ? 'error shake' : ''}`}
                  value={formData.faculty_id}
                  onChange={handleFacultyChange}
                >
                  <option value="">Select Faculty</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                {errors.faculty_id && (
                  <div className="error-message">⚠️ {errors.faculty_id}</div>
                )}
              </div>

              {programs.length > 0 && (
                <div className="field-group">
                  <label className="form-label">Program</label>
                  <select 
                    className={`form-select ${errors.program_id ? 'error shake' : ''}`}
                    value={formData.program_id}
                    onChange={(e) => handleInputChange('program_id', e.target.value)}
                  >
                    <option value="">Select Program</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.program_id && (
                    <div className="error-message">⚠️ {errors.program_id}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {errors.submit && (
            <div className="error-message" style={{ marginBottom: '20px' }}>
              ⚠️ {errors.submit}
            </div>
          )}

          <button 
            type="submit" 
            className={`submit-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;