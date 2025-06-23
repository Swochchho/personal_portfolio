import React, { useState, useContext } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import './style.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Basic validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // 2. Make the login request
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      // 3. Handle successful login
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate(location.state?.from || '/admin');
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      // 4. Enhanced error handling
      let errorMessage = 'Login failed';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data.message || 
                      `Server error: ${err.response.status}`;
        
        console.error('Login error details:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'No response from server';
        console.error('No response received:', err.request);
      } else {
        // Other errors
        errorMessage = err.message;
        console.error('Login error:', err);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="login" className="login-section">
      <div className="container">
        <div className="login-wrapper">
          <Card className="login-card">
            <div className="login-header">
              <h3 className="mb-0">Admin Portal</h3>
              <p className="mb-0">Access your content dashboard</p>
            </div>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="rounded-0">
                  <strong>Error:</strong> {error}
                  <div className="mt-2 small">
                    Need help? Check console for details (F12 → Console)
                  </div>
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit} className="contact__form">
                <Form.Group className="form-group mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control"
                  />
                </Form.Group>
                
                <Form.Group className="form-group mb-4">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-control"
                  />
                </Form.Group>
                
                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : 'Login'}
                </button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;