import React, { useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [authMode, setAuthMode] = useState('register');

  // NEW: keep user object from server login response
  const [user, setUser] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    const emailPattern = /@(spelman\.edu|morehouse\.edu)$/;
    if (!emailPattern.test(email)) {
      setMessage('Email must end with @spelman.edu or @morehouse.edu.');
      return;
    }
    try {
      const response = await axios.post('/register', { name, email, password });
      setMessage(response.data.message || 'Verification code sent to your email!');
      setIsEmailSent(true);
    } catch (error) {
      setMessage('Error during registration: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', { email, password });
      if (response.data.success) {
        const u = response.data.user;
        setUser(u);
        setName(u?.name || 'User');
        setMessage('Login successful!');
        setIsVerified(true);
      } else {
        setMessage(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setMessage('Error during login: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const response = await axios.post('/verify', { email, verificationCode });
      setMessage(response.data.message || 'Email verified successfully!');
      if (response.data.success) {
        // After verify, log them in immediately with the same creds for demo flow
        try {
          const login = await axios.post('/login', { email, password });
          if (login.data.success) {
            const u = login.data.user;
            setUser(u);
            setName(u?.name || 'User');
            setIsVerified(true);
          }
        } catch (e) { /* ignore */ }
      }
    } catch (error) {
      setMessage('Invalid verification code.');
    }
  };

  const handleLogout = () => {
    setName('');
    setEmail('');
    setPassword('');
    setMessage('');
    setVerificationCode('');
    setIsEmailSent(false);
    setIsVerified(false);
    setUser(null);
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Login</button>
    </form>
  );

  const renderRegistrationForm = () => (
    <form onSubmit={handleRegister}>
      <div>
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Register</button>
    </form>
  );

  const renderVerificationForm = () => (
    <div>
      <h2>Verify Your Email</h2>
      <label>Enter Verification Code</label>
      <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
      <button onClick={handleVerifyEmail}>Verify</button>
    </div>
  );

  return (
    <div className="App">
      {!isVerified ? (
        <>
          <h1>Welcome to AUC Tutor</h1>
          {isEmailSent ? (
            renderVerificationForm()
          ) : (
            <>
              <div className="auth-tabs">
                <button className={`tab-btn ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>Register</button>
                <button className={`tab-btn ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Login</button>
              </div>
              {authMode === 'register' ? renderRegistrationForm() : renderLoginForm()}
            </>
          )}
        </>
      ) : (
        <Dashboard name={name} email={email} onLogout={handleLogout} user={user} />
      )}
      {message && <p className="message">{message}</p>}
    </div>
  );
}
export default App;
