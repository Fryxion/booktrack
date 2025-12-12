import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/App.css';

const RegistarPage = ({ onRegisterSuccess, onBackToLogin }) => {
  const { register } = useAuth();
  const [nomeError, setNomeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const nomeInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const handleRegister = async () => {
    // Limpar erros anteriores
    setNomeError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    // Ler valores dos inputs
    const nomeVal = nomeInputRef.current ? nomeInputRef.current.value.trim() : '';
    const emailVal = emailInputRef.current ? emailInputRef.current.value.trim() : '';
    const pwVal = passwordInputRef.current ? passwordInputRef.current.value : '';
    const confirmPwVal = confirmPasswordInputRef.current ? confirmPasswordInputRef.current.value : '';
    
    // Validação de nome
    if (!nomeVal) {
      setNomeError('Nome é obrigatório');
      return;
    }
    if (nomeVal.length < 3) {
      setNomeError('Nome deve ter pelo menos 3 caracteres');
      return;
    }
    
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
    
    // Validação de confirmação de password
    if (!confirmPwVal) {
      setConfirmPasswordError('Confirmação de password é obrigatória');
      return;
    }
    if (pwVal !== confirmPwVal) {
      setConfirmPasswordError('As passwords não coincidem');
      return;
    }
    
    // Fazer registo através da API
    setIsLoading(true);
    
    try {
      const userData = {
        nome: nomeVal,
        email: emailVal,
        password: pwVal,
        tipo: 'aluno' // Tipo padrão para novos registos
      };
      
      const result = await register(userData);
      
      if (result.success) {
        // Sucesso - redirecionar para login com toast
        if (onRegisterSuccess) {
          onRegisterSuccess({ nome: nomeVal, email: emailVal });
        }
      } else {
        // Erro - mostrar mensagem no campo correto
        const errorMsg = result.message.toLowerCase();
        
        if (errorMsg.includes('email')) {
          setEmailError(result.message);
        } else if (errorMsg.includes('password') || errorMsg.includes('senha')) {
          setPasswordError(result.message);
        } else if (errorMsg.includes('nome')) {
          setNomeError(result.message);
        } else {
          // Erro genérico - mostrar no email (campo mais visível)
          setEmailError(result.message);
        }
      }
    } catch (error) {
      setEmailError('Erro ao conectar ao servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleRegister();
    }
  };

  return (
    <main className="login-container">
      <div className="login-box">
        <h1 className="login-title">REGISTAR</h1>
        
        <div>
          <div className="input-group">
            <label className="label">Nome</label>
            <input
              ref={nomeInputRef}
              type="text"
              className={`input ${nomeError ? 'input-error' : ''}`}
              placeholder="O seu nome"
              disabled={isLoading}
              onKeyPress={handleKeyPress}
            />
            {nomeError && <span className="error-message">{nomeError}</span>}
          </div>

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

          <div className="input-group">
            <label className="label">Confirmar Password</label>
            <input
              ref={confirmPasswordInputRef}
              type="password"
              className={`input ${confirmPasswordError ? 'input-error' : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
              onKeyPress={handleKeyPress}
            />
            {confirmPasswordError && <span className="error-message">{confirmPasswordError}</span>}
          </div>

          <button 
            onClick={handleRegister} 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="button-loading">
                <span className="spinner"></span>
                A criar conta...
              </span>
            ) : (
              'Registar'
            )}
          </button>

          <div className="register-prompt">
            <span>Já tem conta? </span>
            <button 
              className="link" 
              disabled={isLoading} 
              onClick={onBackToLogin}
            >
              Fazer login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegistarPage;
