import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/App.css';

const LoginPage = ({ onLoginSuccess, onRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Limpar erros anteriores
    setEmailError('');
    setPasswordError('');
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Email inválido');
      return;
    }
    
    // Validação de password
    if (!password) {
      setPasswordError('Password é obrigatória');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password deve ter pelo menos 6 caracteres');
      return;
    }
    
    // Fazer login através da API
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Sucesso - o AuthContext já guardou o token e mudou isAuthenticated
        if (onLoginSuccess) {
          onLoginSuccess(result.data);
        }
      } else {
        // Erro - mostrar mensagem e NÃO redirecionar
        setPasswordError(result.message || 'Email ou password incorretos');
      }
    } catch (error) {
      console.error('Erro no login:', error);
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input ${passwordError ? 'input-error' : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
              onKeyPress={handleKeyPress}
            />
            {passwordError && <span className="error-message">{passwordError}</span>}
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
