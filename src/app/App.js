import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import withRouter from '../hooks/withRouter';
import AppRoutes from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import Headermain from '../header';
import AnimatedCursor from '../hooks/AnimatedCursor';
import './App.css';
import AuthContext from '../context/AuthContext';
import { ContentProvider } from '../context/ContentContext';
import jwt_decode from 'jwt-decode';
import axios from 'axios';

function _ScrollToTop(props) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return props.children;
}
const ScrollToTop = withRouter(_ScrollToTop);

export default function App() {
  const [authTokens, setAuthTokens] = useState(() => {
    try {
      const tokens = localStorage.getItem('authTokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error('Error parsing authTokens', error);
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const tokens = localStorage.getItem('authTokens');
      return tokens ? jwt_decode(tokens) : null;
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('authTokens');
    setAuthTokens(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const loginUser = useCallback(async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      localStorage.setItem('authTokens', JSON.stringify(response.data));
      setAuthTokens(response.data);
      setUser(jwt_decode(response.data.access));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  }, []);

  useEffect(() => {
    if (!authTokens) {
      setLoading(false);
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;

    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        try {
          const decodedToken = jwt_decode(authTokens.access);
          const isExpired = decodedToken.exp * 1000 < Date.now();
          
          if (!isExpired) return config;

          const response = await axios.post('/api/auth/refresh', {
            refresh: authTokens.refresh
          });
          
          localStorage.setItem('authTokens', JSON.stringify(response.data));
          setAuthTokens(response.data);
          setUser(jwt_decode(response.data.access));
          config.headers['Authorization'] = `Bearer ${response.data.access}`;
          
          return config;
        } catch (error) {
          logoutUser();
          return Promise.reject(error);
        }
      },
      (error) => Promise.reject(error)
    );

    setLoading(false);

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [authTokens, logoutUser]);

  const contextData = {
    user,
    authTokens,
    loginUser,
    logoutUser,
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ContentProvider>
      <AuthContext.Provider value={contextData}>
        <Router basename={process.env.PUBLIC_URL}>
          <div className="cursor__dot">
            <AnimatedCursor
              innerSize={15}
              outerSize={15}
              color="255, 255 ,255"
              outerAlpha={0.4}
              innerScale={0.7}
              outerScale={5}
            />
          </div>
          <ScrollToTop>
            <Headermain />
            <AppRoutes />
          </ScrollToTop>
        </Router>
      </AuthContext.Provider>
    </ContentProvider>
  );
}