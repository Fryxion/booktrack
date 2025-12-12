import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/App.css';

const LoginPage = ({ onLoginSuccess, onRegister }) => {
  const { login } = useAuth();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const handleLogin = async () => {
    // Limpar erros anteriores
    setEmailError('');
    setPasswordError('');
    
    // Ler valores dos inputs
    const emailVal = emailInputRef.current ? emailInputRef.current.value.trim() : '';
    const pwVal = passwordInputRef.current ? passwordInputRef.current.value : '';
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      setEmailError('Email é obrigatório');
      return;
    }
    if (!emailRegex.test(emailVal)) {
      setEmailError('Email inválido');
      return;
    }
    
    // Validação de password
    if (!pwVal) {
      setPasswordError('Password é obrigatória');
      return;
    }
    if (pwVal.length < 6) {
      setPasswordError('Password deve ter pelo menos 6 caracteres');
      return;
    }
    
    // Fazer login através da API
    setIsLoading(true);
    
    try {
      const result = await login(emailVal, pwVal);
      
      if (result.success) {
        // Sucesso - o AuthContext já guardou o token
        if (onLoginSuccess) {
          onLoginSuccess(result.data);
        }
      } else {
        // Erro - mostrar mensagem
        setPasswordError(result.message || 'Credenciais inválidas');
      }
    } catch (error) {
      setPasswordError('Erro ao conectar ao servidor');
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="register-prompt">
          <span>Não tem conta? </span>
          <button 
            className="link" 
            disabled={isLoading} 
            onClick={onRegister}
          >
            Registar
          </button>
        </div>
      </div>
    </div>
  </main>
  );
};

export default LoginPage;
