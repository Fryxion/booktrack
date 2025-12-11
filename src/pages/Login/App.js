import React from 'react';
import '../../styles/App.css';

const LoginPage = ({ 
  email, 
  password, 
  rememberMe, 
  setRememberMe, 
  emailInputRef, 
  passwordInputRef, 
  handleLogin 
}) => (
  <main className="login-container">
    <div className="login-box">
      <h1 className="login-title">LOGIN</h1>
      
      <div>
        <div className="input-group">
          <label className="label">Email</label>
          <input
            ref={emailInputRef}
            type="email"
            defaultValue={email}
            className="input"
            placeholder="seu.email@exemplo.com"
          />
        </div>

        <div className="input-group">
          <label className="label">Password</label>
          <input
            ref={passwordInputRef}
            type="password"
            defaultValue={password}
            className="input"
            placeholder="••••••••"
          />
        </div>

        <div className="checkbox">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="checkbox-input"
          />
          <label htmlFor="remember" style={{ fontSize: '0.875rem' }}>Lembrar conta</label>
        </div>

        <button onClick={handleLogin} className="login-button">
          Log In
        </button>

        <div className="forgot-password">
          <button className="link">
            Esqueceu-se da palavra passe?
          </button>
        </div>
      </div>
    </div>
  </main>
);

export default LoginPage;
