// ==========================================
// PÁGINA DE LOGIN - BOOKTRACK
// ==========================================
// Esta é a página de autenticação do sistema
// Permite que utilizadores façam login com:
// - 📧 Email (validado com regex)
// - 🔒 Password (mínimo 6 caracteres)
// - ✅ Validação em tempo real dos campos
// - 🔄 Estado de loading durante o processo
// - ⚠️ Mensagens de erro específicas
// - ⌨️ Suporte para tecla Enter
//
// O login é feito através do AuthContext que:
// 1. Chama a API de autenticação
// 2. Guarda o token no localStorage
// 3. Atualiza o estado global do utilizador

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - LoginPage
// ==========================================
const LoginPage = ({ onLoginSuccess, onRegister }) => {
  // ------------------------------------------
  // CONTEXTO DE AUTENTICAÇÃO
  // ------------------------------------------
  // Função login do AuthContext para fazer a autenticação
  const { login } = useAuth();

  // ------------------------------------------
  // ESTADO DO COMPONENTE
  // ------------------------------------------
  // email: Armazena o email digitado pelo utilizador
  const [email, setEmail] = useState('');
  
  // password: Armazena a password digitada (tipo password no input)
  const [password, setPassword] = useState('');
  
  // emailError: Mensagem de erro para o campo email
  // Pode ser: "Email é obrigatório", "Email inválido"
  const [emailError, setEmailError] = useState('');
  
  // passwordError: Mensagem de erro para o campo password
  // Pode ser: "Password é obrigatória", "Password deve ter pelo menos 6 caracteres",
  // "Email ou password incorretos", "Erro ao conectar ao servidor"
  const [passwordError, setPasswordError] = useState('');
  
  // isLoading: Indica se está a processar o login
  // true = mostra spinner e desativa inputs/botões
  // false = estado normal, utilizador pode interagir
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // FUNÇÃO: handleLogin
  // ==========================================
  // O QUÊ: Processa o login do utilizador
  // PORQUÊ: Validar credenciais antes de enviar para o servidor
  // COMO:
  //   1. Limpa erros anteriores
  //   2. Valida email (obrigatório + formato correto)
  //   3. Valida password (obrigatória + mínimo 6 caracteres)
  //   4. Chama API através do AuthContext
  //   5. Se sucesso: chama onLoginSuccess (App.js redireciona)
  //   6. Se erro: mostra mensagem no campo password
  //
  // VALIDAÇÕES:
  //   Email:
  //     - Não pode estar vazio (trim remove espaços)
  //     - Deve seguir formato: algo@algo.algo
  //     - Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  //       ^ = início, $ = fim
  //       [^\s@]+ = um ou mais caracteres que não sejam espaço ou @
  //       @ = arroba obrigatória
  //       \. = ponto literal obrigatório
  //   Password:
  //     - Não pode estar vazia
  //     - Mínimo 6 caracteres
  const handleLogin = async () => {
    // Limpar erros anteriores para nova tentativa
    setEmailError('');
    setPasswordError('');
    
    // ------------------------------------------
    // VALIDAÇÃO DE EMAIL
    // ------------------------------------------
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Verifica se email está vazio (trim remove espaços)
    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      return;
    }
    
    // Verifica se email tem formato válido
    if (!emailRegex.test(email)) {
      setEmailError('Email inválido');
      return;
    }
    
    // ------------------------------------------
    // VALIDAÇÃO DE PASSWORD
    // ------------------------------------------
    // Verifica se password está vazia
    if (!password) {
      setPasswordError('Password é obrigatória');
      return;
    }
    
    // Verifica comprimento mínimo (segurança básica)
    if (password.length < 6) {
      setPasswordError('Password deve ter pelo menos 6 caracteres');
      return;
    }
    
    // ------------------------------------------
    // CHAMADA À API DE LOGIN
    // ------------------------------------------
    // Ativa loading: desativa inputs e mostra spinner
    setIsLoading(true);
    
    try {
      // Chama função login do AuthContext
      // Esta função:
      // - Faz POST para /api/auth/login
      // - Guarda token no localStorage
      // - Atualiza estado global do utilizador
      const result = await login(email, password);
      
      if (result.success) {
        // SUCESSO: AuthContext já atualizou tudo
        // Chama callback para App.js redirecionar para página inicial
        if (onLoginSuccess) {
          onLoginSuccess(result.data);
        }
      } else {
        // ERRO: Credenciais inválidas
        // Mostra mensagem de erro (não revela qual campo está errado por segurança)
        setPasswordError(result.message || 'Email ou password incorretos');
      }
    } catch (error) {
      // ERRO DE REDE: Servidor offline ou sem internet
      console.error('Erro no login:', error);
      setPasswordError('Erro ao conectar ao servidor');
    } finally {
      // Sempre desativa loading no final (sucesso ou erro)
      setIsLoading(false);
    }
  };

  // ==========================================
  // FUNÇÃO: handleKeyPress
  // ==========================================
  // O QUÊ: Permite fazer login pressionando Enter
  // PORQUÊ: Melhorar UX - utilizador não precisa usar o rato
  // COMO: Detecta tecla Enter em qualquer input e chama handleLogin
  //
  // NOTA: Só funciona se não estiver em loading (evita múltiplos submits)
  const handleKeyPress = (e) => {
    // Se pressionou Enter E não está a processar outro login
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <main className="login-container">
      {/* Caixa centralizada com o formulário de login */}
      <div className="login-box">
        {/* Título da página */}
        <h1 className="login-title">LOGIN</h1>
        
        <div>
          {/* ------------------------------------------
              CAMPO DE EMAIL
              ------------------------------------------
              Input controlado: value={email} + onChange={setEmail}
              - type="email": Teclado otimizado em mobile
              - className condicional: adiciona 'input-error' se houver erro
              - disabled={isLoading}: Desativa durante processamento
              - onKeyPress: Permite submeter com Enter
          */}
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
            {/* Mensagem de erro (só aparece se emailError tiver conteúdo) */}
            {emailError && <span className="error-message">{emailError}</span>}
          </div>

          {/* ------------------------------------------
              CAMPO DE PASSWORD
              ------------------------------------------
              Similar ao email, mas:
              - type="password": Oculta caracteres digitados (••••)
              - placeholder com bullets para indicar campo de password
          */}
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
            {/* Mensagem de erro (só aparece se passwordError tiver conteúdo) */}
            {passwordError && <span className="error-message">{passwordError}</span>}
          </div>

        {/* ------------------------------------------
            BOTÃO DE LOGIN
            ------------------------------------------
            - disabled={isLoading}: Previne múltiplos cliques
            - Conteúdo condicional:
              * Se isLoading: mostra spinner + "A entrar..."
              * Se não: mostra "Log In"
        */}
        <button 
          onClick={handleLogin} 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? (
            // Estado de loading: spinner animado + texto
            <span className="button-loading">
              <span className="spinner"></span>
              A entrar...
            </span>
          ) : (
            // Estado normal: texto simples
            'Log In'
          )}
        </button>

        {/* ------------------------------------------
            LINK PARA REGISTO
            ------------------------------------------
            Permite ir para página de registo se não tiver conta
            - Também fica disabled durante loading
            - onClick={onRegister}: Callback para App.js mudar de página
        */}
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
