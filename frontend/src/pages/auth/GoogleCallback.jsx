import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/APIs/axios';
import { StudentContext } from '@/context/StudentContext';

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(StudentContext);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleGoogleAuth = async () => {
      // Access token or credential might be in query parameters, hash, or state
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      const stateCredential = location.state?.credential || location.state?.access_token;
      
      // If code or credential is not directly found, try parsing the hash/URL
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      const tokenToSend = stateCredential || code || accessToken;

      if (!tokenToSend) {
        setError('No authentication token found. Please try logging in again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Post the token to the backend
        const response = await api.post('/auth/google/', {
          credential: tokenToSend
        });

        const data = response.data;

        // Save session in local storage
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);

        if (data.user.role === 'student') {
          setUser({
            name: data.user.full_name || data.user.name || '',
            phone: data.user.phone || '',
            email: data.user.email || '',
            avatar: localStorage.getItem(`student_avatar_${data.user.email}`) || ''
          });
        }

        // Redirect based on role
        switch (data.user.role) {
          case "student":
            navigate("/student", { replace: true });
            break;
          case "vendor":
            navigate("/vendor-dashboard", { replace: true });
            break;
          case "admin":
            navigate("/admin", { replace: true });
            break;
          default:
            navigate("/", { replace: true });
        }
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 'Google authentication failed. Please check if your account is registered.';
        setError(errorMsg);
        setTimeout(() => {
          navigate('/login', { state: { error: errorMsg } });
        }, 3000);
      }
    };

    handleGoogleAuth();
  }, [location, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f9ff',
      fontFamily: "'Outfit', sans-serif",
      padding: '24px',
      textAlign: 'center'
    }}>
      {!error ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div className="animate-spin" style={{
            width: '50px',
            height: '50px',
            border: '5px solid #e2e8f0',
            borderTopColor: '#855300',
            borderRadius: '50%',
          }}></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b1c30' }}>Authenticating with Google</h2>
          <p style={{ color: '#534434', fontSize: '0.95rem' }}>Please wait while we log you into Campus Lunch...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            color: '#ba1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>error</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ba1a1a' }}>Authentication Error</h2>
          <p style={{ color: '#534434', maxWidth: '360px', lineHeight: '1.5' }}>{error}</p>
          <p style={{ color: '#7c6e60', fontSize: '0.85rem', marginTop: '10px' }}>Redirecting you back to login page...</p>
        </div>
      )}
    </div>
  );
};

export default GoogleCallback;
