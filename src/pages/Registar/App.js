// ==========================================
// PÁGINA DE REGISTO - BOOKTRACK
// ==========================================
// Esta é a página onde novos utilizadores criam conta
// Funcionalidades:
// - ✏️ Formulário com 4 campos (nome, email, password, confirmar password)
// - ✅ Validação completa antes de enviar
// - 🔒 Confirmação de password para evitar erros
// - 🎯 useRef para aceder aos valores dos inputs
// - 🔄 Estado de loading durante criação
// - ⚠️ Mensagens de erro específicas por campo
// - ⌨️ Suporte para tecla Enter
//
// VALIDAÇÕES:
// - Nome: Mínimo 3 caracteres
// - Email: Formato válido (regex)
// - Password: Mínimo 6 caracteres
// - Confirmação: Deve ser igual à password
//
// TIPO PADRÃO: Novos utilizadores são criados como 'aluno'
// (Bibliotecários podem alterar o tipo depois no painel admin)

import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - RegistarPage
// ==========================================
const RegistarPage = ({ onRegisterSuccess, onBackToLogin }) => {
  // ------------------------------------------
  // CONTEXTO DE AUTENTICAÇÃO
  // ------------------------------------------
  // Função register do AuthContext para criar nova conta
  const { register } = useAuth();

  // ------------------------------------------
  // ESTADO DO COMPONENTE - Erros
  // ------------------------------------------
  // Cada campo tem sua própria mensagem de erro independente
  // Isto permite mostrar erros específicos em cada input
  
  // nomeError: Mensagem de erro para o campo nome
  // Pode ser: "Nome é obrigatório", "Nome deve ter pelo menos 3 caracteres"
  const [nomeError, setNomeError] = useState('');
  
  // emailError: Mensagem de erro para o campo email
  // Pode ser: "Email é obrigatório", "Email inválido", "Email já está em uso"
  const [emailError, setEmailError] = useState('');
  
  // passwordError: Mensagem de erro para o campo password
  // Pode ser: "Password é obrigatória", "Password deve ter pelo menos 6 caracteres"
  const [passwordError, setPasswordError] = useState('');
  
  // confirmPasswordError: Mensagem de erro para confirmação
  // Pode ser: "Confirmação de password é obrigatória", "As passwords não coincidem"
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // isLoading: Indica se está a processar o registo
  // true = mostra spinner e desativa inputs/botões
  const [isLoading, setIsLoading] = useState(false);
  
  // ------------------------------------------
  // REFS PARA INPUTS
  // ------------------------------------------
  // useRef permite aceder diretamente aos valores dos inputs HTML
  // Alternativa a useState: mais leve, não causa re-renders
  // Acedemos ao valor com: nomeInputRef.current.value
  
  // Referência para o input de nome
  const nomeInputRef = useRef(null);
  
  // Referência para o input de email
  const emailInputRef = useRef(null);
  
  // Referência para o input de password
  const passwordInputRef = useRef(null);
  
  // Referência para o input de confirmação de password
  const confirmPasswordInputRef = useRef(null);

  // ==========================================
  // FUNÇÃO: handleRegister
  // ==========================================
  // O QUÊ: Processa o registo de novo utilizador
  // PORQUÊ: Validar todos os campos antes de criar conta
  // COMO:
  //   1. Limpa todos os erros anteriores
  //   2. Lê valores dos inputs via refs
  //   3. Valida cada campo (nome, email, password, confirmação)
  //   4. Se tudo válido: chama API através do AuthContext
  //   5. Se sucesso: chama onRegisterSuccess (redireciona para login)
  //   6. Se erro: mostra mensagem no campo apropriado
  //
  // VALIDAÇÕES:
  //   Nome:
  //     - Não pode estar vazio (trim remove espaços)
  //     - Mínimo 3 caracteres
  //   Email:
  //     - Não pode estar vazio
  //     - Deve seguir formato: algo@algo.algo
  //     - Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  //   Password:
  //     - Não pode estar vazia
  //     - Mínimo 6 caracteres (segurança básica)
  //   Confirmação:
  //     - Não pode estar vazia
  //     - Deve ser exatamente igual à password
  const handleRegister = async () => {
    // ------------------------------------------
    // PASSO 1: Limpar erros anteriores
    // ------------------------------------------
    setNomeError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    // ------------------------------------------
    // PASSO 2: Ler valores dos inputs via refs
    // ------------------------------------------
    // trim() remove espaços no início/fim (para nome e email)
    // password NÃO usa trim (pode ter espaços propositadamente)
    const nomeVal = nomeInputRef.current ? nomeInputRef.current.value.trim() : '';
    const emailVal = emailInputRef.current ? emailInputRef.current.value.trim() : '';
    const pwVal = passwordInputRef.current ? passwordInputRef.current.value : '';
    const confirmPwVal = confirmPasswordInputRef.current ? confirmPasswordInputRef.current.value : '';
    
    // ------------------------------------------
    // PASSO 3: VALIDAÇÃO DE NOME
    // ------------------------------------------
    // Verifica se nome está vazio
    if (!nomeVal) {
      setNomeError('Nome é obrigatório');
      return; // Para aqui, não continua
    }
    
    // Verifica comprimento mínimo
    if (nomeVal.length < 3) {
      setNomeError('Nome deve ter pelo menos 3 caracteres');
      return;
    }
    
    // ------------------------------------------
    // PASSO 4: VALIDAÇÃO DE EMAIL
    // ------------------------------------------
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Verifica se email está vazio
    if (!emailVal) {
      setEmailError('Email é obrigatório');
      return;
    }
    
    // Verifica se email tem formato válido
    if (!emailRegex.test(emailVal)) {
      setEmailError('Email inválido');
      return;
    }
    
    // ------------------------------------------
    // PASSO 5: VALIDAÇÃO DE PASSWORD
    // ------------------------------------------
    // Verifica se password está vazia
    if (!pwVal) {
      setPasswordError('Password é obrigatória');
      return;
    }
    
    // Verifica comprimento mínimo (segurança básica)
    if (pwVal.length < 6) {
      setPasswordError('Password deve ter pelo menos 6 caracteres');
      return;
    }
    
    // ------------------------------------------
    // PASSO 6: VALIDAÇÃO DE CONFIRMAÇÃO
    // ------------------------------------------
    // Verifica se confirmação está vazia
    if (!confirmPwVal) {
      setConfirmPasswordError('Confirmação de password é obrigatória');
      return;
    }
    
    // Verifica se passwords coincidem (comparação exata)
    if (pwVal !== confirmPwVal) {
      setConfirmPasswordError('As passwords não coincidem');
      return;
    }
    
    // ------------------------------------------
    // PASSO 7: CHAMADA À API DE REGISTO
    // ------------------------------------------
    // Ativa loading: desativa inputs e mostra spinner
    setIsLoading(true);
    
    try {
      // Prepara objeto com dados do utilizador
      // tipo padrão: 'aluno' (bibliotecários alteram depois se necessário)
      const userData = {
        nome: nomeVal,
        email: emailVal,
        password: pwVal,
        tipo: 'aluno' // Tipo padrão para novos registos
      };
      
      // Chama função register do AuthContext
      // Esta função faz POST para /api/auth/register
      const result = await register(userData);
      
      if (result.success) {
        // SUCESSO: Conta criada!
        // Chama callback para App.js mostrar toast + redirecionar para login
        if (onRegisterSuccess) {
          onRegisterSuccess({ nome: nomeVal, email: emailVal });
        }
      } else {
        // ERRO: Falha ao criar conta
        // Analisa mensagem para mostrar no campo correto
        const errorMsg = result.message.toLowerCase();
        
        // Se mensagem contém "email", mostra erro no campo email
        if (errorMsg.includes('email')) {
          setEmailError(result.message);
        // Se mensagem contém "password" ou "senha", mostra no campo password
        } else if (errorMsg.includes('password') || errorMsg.includes('senha')) {
          setPasswordError(result.message);
        // Se mensagem contém "nome", mostra no campo nome
        } else if (errorMsg.includes('nome')) {
          setNomeError(result.message);
        } else {
          // Erro genérico - mostra no email (campo mais visível)
          setEmailError(result.message);
        }
      }
    } catch (error) {
      // ERRO DE REDE: Servidor offline ou sem internet
      setEmailError('Erro ao conectar ao servidor');
    } finally {
      // Sempre desativa loading no final (sucesso ou erro)
      setIsLoading(false);
    }
  };

  // ==========================================
  // FUNÇÃO: handleKeyPress
  // ==========================================
  // O QUÊ: Permite fazer registo pressionando Enter
  // PORQUÊ: Melhorar UX - utilizador não precisa usar o rato
  // COMO: Detecta tecla Enter em qualquer input e chama handleRegister
  //
  // NOTA: Só funciona se não estiver em loading (evita múltiplos submits)
  const handleKeyPress = (e) => {
    // Se pressionou Enter E não está a processar outro registo
    if (e.key === 'Enter' && !isLoading) {
      handleRegister();
    }
  };

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <main className="login-container">
      {/* Caixa centralizada com o formulário de registo */}
      <div className="login-box">
        {/* Título da página */}
        <h1 className="login-title">REGISTAR</h1>
        
        <div>
          {/* ------------------------------------------
              CAMPO DE NOME
              ------------------------------------------
              Input com ref (não controlado)
              - ref={nomeInputRef}: Referência para aceder ao valor
              - className condicional: adiciona 'input-error' se houver erro
              - disabled={isLoading}: Desativa durante processamento
              - onKeyPress: Permite submeter com Enter
          */}
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
            {/* Mensagem de erro (só aparece se nomeError tiver conteúdo) */}
            {nomeError && <span className="error-message">{nomeError}</span>}
          </div>

          {/* ------------------------------------------
              CAMPO DE EMAIL
              ------------------------------------------ */}
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

          {/* ------------------------------------------
              CAMPO DE PASSWORD
              ------------------------------------------ */}
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

          {/* ------------------------------------------
              CAMPO DE CONFIRMAR PASSWORD
              ------------------------------------------
              Campo adicional para evitar erros de digitação
              Utilizador tem que digitar a password duas vezes
          */}
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

          {/* ------------------------------------------
              BOTÃO DE REGISTO
              ------------------------------------------
              - disabled={isLoading}: Previne múltiplos cliques
              - Conteúdo condicional:
                * Se isLoading: mostra spinner + "A criar conta..."
                * Se não: mostra "Registar"
          */}
          <button 
            onClick={handleRegister} 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              // Estado de loading: spinner animado + texto
              <span className="button-loading">
                <span className="spinner"></span>
                A criar conta...
              </span>
            ) : (
              // Estado normal: texto simples
              'Registar'
            )}
          </button>

          {/* ------------------------------------------
              LINK PARA LOGIN
              ------------------------------------------
              Permite voltar para login se já tiver conta
              - Também fica disabled durante loading
              - onClick={onBackToLogin}: Callback para App.js mudar de página
          */}
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
