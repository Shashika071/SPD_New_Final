import 'react-toastify/dist/ReactToastify.css';
import './LoginSignup.css'; // We'll create this CSS file

import React, { useState } from 'react';

import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LoginSignup = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    tel_num: '',
    nic: '',
    highest_qualification: '',
    degrees: [],
    diplomas: [],
    specialization: '',
    experience_years: '',
    currentDegree: '',
    currentDiploma: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!isLogin) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.tel_num) {
        newErrors.tel_num = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.tel_num)) {
        newErrors.tel_num = 'Phone number must be 10 digits';
      }
      if (!formData.nic) newErrors.nic = 'NIC is required';
      if (!formData.highest_qualification) {
        newErrors.highest_qualification = 'Highest qualification is required';
      }
      if (!formData.specialization) {
        newErrors.specialization = 'Specialization is required';
      }
      if (!formData.experience_years) {
        newErrors.experience_years = 'Experience is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDegree = () => {
    if (formData.currentDegree.trim()) {
      setFormData({
        ...formData,
        degrees: [...formData.degrees, formData.currentDegree],
        currentDegree: ''
      });
    }
  };

  const handleRemoveDegree = (index) => {
    const updatedDegrees = [...formData.degrees];
    updatedDegrees.splice(index, 1);
    setFormData({ ...formData, degrees: updatedDegrees });
  };

  const handleAddDiploma = () => {
    if (formData.currentDiploma.trim()) {
      setFormData({
        ...formData,
        diplomas: [...formData.diplomas, formData.currentDiploma],
        currentDiploma: ''
      });
    }
  };

  const handleRemoveDiploma = (index) => {
    const updatedDiplomas = [...formData.diplomas];
    updatedDiplomas.splice(index, 1);
    setFormData({ ...formData, diplomas: updatedDiplomas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const payload = isLogin ? {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      } : {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        tel_num: formData.tel_num,
        nic: formData.nic,
        highest_qualification: formData.highest_qualification,
        degrees: formData.degrees,
        diplomas: formData.diplomas,
        specialization: formData.specialization,
        experience_years: formData.experience_years
      };

      const response = await axios.post(
        `http://localhost:4000/api/teachers/${endpoint}`, 
        payload
      );

      if (response.data.success) {
  toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('teacher', JSON.stringify(response.data.teacher)); // Make sure this matches your API response
  navigate('/admin');
      } else {
        toast.error(response.data.message || 
          (isLogin ? 'Login failed' : 'Registration failed'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 
        `Error during ${isLogin ? 'login' : 'registration'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setActiveTab(isLogin ? 'signup' : 'login');
    setErrors({});
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-background-overlay"></div>
        <div className="auth-background-shapes">
          <div className="shape-1"></div>
          <div className="shape-2"></div>
          <div className="shape-3"></div>
        </div>
      </div>
      
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="logo-container">
              <div className="logo-circle">
                <i className="fas fa-graduation-cap logo-icon"></i>
              </div>
              <h1>PHENIX LMS</h1>
            </div>
            <h2 className="auth-title">
              {isLogin ? 'Welcome Back!' : 'Join Our Community'}
            </h2>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Sign in to access your personalized dashboard' 
                : 'Create an account to start your teaching journey'}
            </p>
          </div>

          {/* Form section */}
          <div className="auth-body">
            {/* Social login options (for login only) */}
            {isLogin && (
              <div className="social-login">
    
              </div>
            )}

            {/* Form toggle tabs */}
            <div className="form-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  if (activeTab !== 'login') {
                    setIsLogin(true);
                    setActiveTab('login');
                  }
                }}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                Sign In
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  if (activeTab !== 'signup') {
                    setIsLogin(false);
                    setActiveTab('signup');
                  }
                }}
              >
                <i className="fas fa-user-plus me-2"></i>
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Name field (register only) */}
              {!isLogin && (
                <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                  <label>
                    <i className="fas fa-user icon"></i>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
              )}

              {/* Email field */}
              <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                <label>
                  <i className="fas fa-envelope icon"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              {/* Password field */}
              <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                <label>
                  <i className="fas fa-lock icon"></i>
                  Password
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              {/* Confirm Password (register only) */}
              {!isLogin && (
                <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
                  <label>
                    <i className="fas fa-lock icon"></i>
                    Confirm Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword}</div>
                  )}
                </div>
              )}

              {/* Remember me (login only) */}
              {isLogin && (
                <div className="form-options">
                  <div className="form-check remember-me">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
               
                </div>
              )}

              {/* Registration-specific fields */}
              {!isLogin && (
                <>
                  {/* NIC field */}
                  <div className={`form-group ${errors.nic ? 'has-error' : ''}`}>
                    <label>
                      <i className="fas fa-id-card icon"></i>
                      National ID
                    </label>
                    <input
                      type="text"
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      placeholder="Enter your national ID"
                      className={`form-control ${errors.nic ? 'is-invalid' : ''}`}
                    />
                    {errors.nic && <div className="invalid-feedback">{errors.nic}</div>}
                  </div>

                  {/* Phone number */}
                  <div className={`form-group ${errors.tel_num ? 'has-error' : ''}`}>
                    <label>
                      <i className="fas fa-phone icon"></i>
                      Phone Number
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">+94</span>
                      <input
                        type="tel"
                        name="tel_num"
                        value={formData.tel_num}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        maxLength="10"
                        className={`form-control ${errors.tel_num ? 'is-invalid' : ''}`}
                      />
                    </div>
                    {errors.tel_num && <div className="invalid-feedback">{errors.tel_num}</div>}
                  </div>

                  {/* Highest Qualification */}
                  <div className={`form-group ${errors.highest_qualification ? 'has-error' : ''}`}>
                    <label>
                      <i className="fas fa-graduation-cap icon"></i>
                      Highest Qualification
                    </label>
                    <select
                      name="highest_qualification"
                      value={formData.highest_qualification}
                      onChange={handleChange}
                      className={`form-control ${errors.highest_qualification ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select highest qualification</option>
                      <option value="PhD">PhD</option>
                      <option value="Master's">Master's Degree</option>
                      <option value="Bachelor's">Bachelor's Degree</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.highest_qualification && (
                      <div className="invalid-feedback">{errors.highest_qualification}</div>
                    )}
                  </div>

                  {/* Degrees */}
                  <div className="form-group">
                    <label>
                      <i className="fas fa-certificate icon"></i>
                      Degrees
                    </label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        name="currentDegree"
                        value={formData.currentDegree}
                        onChange={handleChange}
                        placeholder="Add degree (e.g., BSc Computer Science)"
                        className="form-control"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleAddDegree}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    {formData.degrees.length > 0 && (
                      <div className="selected-items">
                        {formData.degrees.map((degree, index) => (
                          <span key={index} className="badge bg-primary me-2 mb-2">
                            {degree}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-2"
                              onClick={() => handleRemoveDegree(index)}
                              aria-label="Remove"
                            />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Diplomas */}
                  <div className="form-group">
                    <label>
                      <i className="fas fa-certificate icon"></i>
                      Diplomas
                    </label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        name="currentDiploma"
                        value={formData.currentDiploma}
                        onChange={handleChange}
                        placeholder="Add diploma (e.g., Diploma in Education)"
                        className="form-control"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleAddDiploma}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    {formData.diplomas.length > 0 && (
                      <div className="selected-items">
                        {formData.diplomas.map((diploma, index) => (
                          <span key={index} className="badge bg-primary me-2 mb-2">
                            {diploma}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-2"
                              onClick={() => handleRemoveDiploma(index)}
                              aria-label="Remove"
                            />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Specialization */}
                  <div className={`form-group ${errors.specialization ? 'has-error' : ''}`}>
                    <label>
                      <i className="fas fa-atom icon"></i>
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="Your teaching specialization"
                      className={`form-control ${errors.specialization ? 'is-invalid' : ''}`}
                    />
                    {errors.specialization && (
                      <div className="invalid-feedback">{errors.specialization}</div>
                    )}
                  </div>

                  {/* Years of Experience */}
                  <div className={`form-group ${errors.experience_years ? 'has-error' : ''}`}>
                    <label>
                      <i className="fas fa-briefcase icon"></i>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                      min="0"
                      max="50"
                      placeholder="Number of years teaching"
                      className={`form-control ${errors.experience_years ? 'is-invalid' : ''}`}
                    />
                    {errors.experience_years && (
                      <div className="invalid-feedback">{errors.experience_years}</div>
                    )}
                  </div>

                  {/* Terms and conditions */}
                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="termsCheck"
                      required
                    />
                    <label className="form-check-label" htmlFor="termsCheck">
                      I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                    </label>
                  </div>
                </>
              )}

              {/* Submit button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {isLogin ? 'Signing in...' : 'Registering...'}
                  </>
                ) : (
                  <>
                    <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'} me-2`}></i>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

            {/* Toggle form link */}
            <div className="toggle-form-link">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={toggleForm} className="toggle-link">
                {isLogin ? 'Sign up now' : 'Sign in here'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              <i className="fas fa-shield-alt me-2"></i>
              Your data is securely protected with 256-bit encryption
            </p>
            <p className="copyright">
              © {new Date().getFullYear()} PHENIX LMS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;