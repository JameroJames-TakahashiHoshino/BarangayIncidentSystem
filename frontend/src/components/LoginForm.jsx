import { useState } from 'react';
import logo from '../assets/barangay-logo.jpg';
import background from '../assets/barangay-commonwealth.jpg';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'resident'
};

function LoginForm({ onLogin, onRegister, loading, errorMessage }) {
  const [form, setForm] = useState(initialForm);
  const [localError, setLocalError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState('login');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (mode === 'register') {
      if (!form.fullName || !form.email || !form.password || !form.role) {
        setLocalError('Full name, email, password, and role are required.');
        return;
      }
      setLocalError('');
      setInfoMessage('');
      onRegister({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      });
      return;
    }

    if (!form.email || !form.password) {
      setLocalError('Email and password are required.');
      return;
    }

    setLocalError('');
    setInfoMessage('');
    onLogin({ email: form.email.trim(), password: form.password });
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setLocalError('');
    setInfoMessage('');
  };

  return (
    <div className="auth-shell" style={{ backgroundImage: `url(${background})` }}>
      <div className="auth-overlay" />

      <header className="auth-topbar">
        <div className="auth-brand">
          <img src={logo} alt="Barangay IRS logo" className="auth-brand-logo" />
          <div>
            <p className="auth-brand-title">Barangay IRS</p>
            <p className="auth-brand-subtitle">Incident Reporting System</p>
          </div>
        </div>
        <div className="auth-details">
          <div>
            <p className="auth-detail-title">Barangay Commonwealth</p>
            <p className="auth-detail-line">Hotline: 8-9518-466 · Office Hours: 8am - 4:30pm</p>
          </div>
          <p className="auth-detail-line">Email: maningning.commonwealth@gmail.com</p>
          <p className="auth-detail-tagline">
            To provide accessible basic services, maintain peace and order, and ensure efficient governance in partnership
            with the community.
          </p>
        </div>
      </header>

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-card-header">
            <img src={logo} alt="Barangay IRS logo" className="auth-logo" />
            <div>
              <h1>Barangay IRS</h1>
              <p className="subtitle">Incident Reporting System</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            {mode === 'register' && (
              <label>
                Full Name
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {mode === 'register' && (
              <label>
                Role
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="resident">Resident</option>
                  <option value="personnel">Personnel</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            )}

            {(localError || errorMessage) && <p className="message error">{localError || errorMessage}</p>}
            {infoMessage && <p className="message info">{infoMessage}</p>}

            {mode === 'login' && (
              <button
                type="button"
                className="link-btn"
                onClick={() => setInfoMessage('Please contact your barangay administrator to reset your password.')}
              >
                Forgot your password?
              </button>
            )}

            <button type="submit" disabled={loading}>
              {loading
                ? mode === 'register'
                  ? 'Creating account...'
                  : 'Logging in...'
                : mode === 'register'
                  ? 'Create Account'
                  : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="helper-text">Need help? Contact your barangay administrator.</p>
            <button type="button" className="link-btn" onClick={toggleMode}>
              {mode === 'register' ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
