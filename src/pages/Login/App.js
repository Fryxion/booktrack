import React from 'react';
import '../../styles/App.css';

const LoginPage = ({ 
  email, 
  password, 
  rememberMe, 
  setRememberMe, 
  emailInputRef, 
  passwordInputRef, 
  handleLogin,
  emailError,
  passwordError,
  isLoading,
  onForgotPassword
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
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
              className={`input ${emailError ? 'input-error' : ''}`}
              placeholder="seu.email@exemplo.com"
              disabled={isLoading}
              onKeyPress={handleKeyPress}
            />
            {emailError && <span className="error-message">{emailError}</span>}
          </div>

          <div className="input-group">
            <label className="label">Password</label>
            <input
              ref={passwordInputRef}
              type="password"
              defaultValue={password}
              className={`input ${passwordError ? 'input-error' : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
              onKeyPress={handleKeyPress}
            />
            {passwordError && <span className="error-message">{passwordError}</span>}
          </div>

        <div className="checkbox">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="checkbox-input"
            disabled={isLoading}
          />
          <label htmlFor="remember" style={{ fontSize: '0.875rem' }}>Lembrar conta</label>
        </div>

        <button 
          onClick={handleLogin} 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="button-loading">
              <span className="spinner"></span>
              A entrar...
            </span>
          ) : (
            'Log In'
          )}
        </button>

        <div className="forgot-password">
          <button className="link" disabled={isLoading} onClick={onForgotPassword}>
            Esqueceu-se da palavra passe?
          </button>
        </div>
      </div>
    </div>
  </main>
  );
};

export default LoginPage;
