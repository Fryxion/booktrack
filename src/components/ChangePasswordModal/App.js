// ==========================================
// COMPONENTE: ChangePasswordModal
// ==========================================
// Modal para alterar password do utilizador
//
// FUNCIONALIDADES:
// - 🔒 Formulário com 3 campos (atual, nova, confirmar)
// - ✅ Validações completas antes de enviar
// - 🔄 Estado de loading durante processo
// - ⚠️ Mensagens de erro específicas por campo
// - ✨ Limpa campos ao fechar
// - ⌨️ Suporte para tecla Enter
//
// VALIDAÇÕES:
// - Password atual: Obrigatória
// - Nova password: Mínimo 6 caracteres
// - Confirmação: Deve coincidir com nova password
// - Nova password deve ser DIFERENTE da atual
//
// PROPS:
// - isOpen: Boolean - modal aberto ou fechado
// - onClose: Função - chamada ao fechar modal
// - showToast: Função - para mostrar notificações
//
// USADO EM: PerfilPage (quando clica "Alterar password")

import React, { useState, useRef } from 'react';
import { authAPI } from '../../services/api';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - ChangePasswordModal
// ==========================================
const ChangePasswordModal = ({ isOpen, onClose, showToast }) => {
  // ------------------------------------------
  // ESTADO - Mensagens de erro
  // ------------------------------------------
  // Cada campo tem sua própria mensagem de erro
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // isLoading: Indica se está a processar alteração
  const [isLoading, setIsLoading] = useState(false);

  // ------------------------------------------
  // REFS - Acesso direto aos inputs
  // ------------------------------------------
  // useRef permite ler valores sem causar re-renders
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // ==========================================
  // FUNÇÃO: handleSubmit
  // ==========================================
  // O QUÊ: Processa alteração de password
  // COMO:
  //   1. Limpa erros anteriores
  //   2. Lê valores dos inputs
  //   3. Valida todos os campos
  //   4. Chama API authAPI.updatePassword()
  //   5. Se sucesso: mostra toast verde + fecha modal
  //   6. Se erro: mostra mensagem no campo apropriado
  //
  // VALIDAÇÕES:
  //   1. Password atual obrigatória
  //   2. Nova password obrigatória + mínimo 6 caracteres
  //   3. Confirmação obrigatória + igual à nova
  //   4. Nova password diferente da atual
  const handleSubmit = async () => {
    // ------------------------------------------
    // PASSO 1: Limpar erros anteriores
    // ------------------------------------------
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    // ------------------------------------------
    // PASSO 2: Ler valores dos inputs
    // ------------------------------------------
    const currentPw = currentPasswordRef.current?.value || '';
    const newPw = newPasswordRef.current?.value || '';
    const confirmPw = confirmPasswordRef.current?.value || '';

    // ------------------------------------------
    // PASSO 3: VALIDAÇÕES
    // ------------------------------------------
    // Validação 1: Password atual obrigatória
    if (!currentPw) {
      setCurrentPasswordError('Password atual é obrigatória');
      return;
    }

    // Validação 2: Nova password obrigatória
    if (!newPw) {
      setNewPasswordError('Nova password é obrigatória');
      return;
    }

    // Validação 3: Nova password mínimo 6 caracteres
    if (newPw.length < 6) {
      setNewPasswordError('Nova password deve ter pelo menos 6 caracteres');
      return;
    }

    // Validação 4: Confirmação obrigatória
    if (!confirmPw) {
      setConfirmPasswordError('Confirmação de password é obrigatória');
      return;
    }

    // Validação 5: Passwords devem coincidir
    if (newPw !== confirmPw) {
      setConfirmPasswordError('As passwords não coincidem');
      return;
    }

    // Validação 6: Nova password deve ser diferente
    if (currentPw === newPw) {
      setNewPasswordError('Nova password deve ser diferente da atual');
      return;
    }

    // ------------------------------------------
    // PASSO 4: CHAMADA À API
    // ------------------------------------------
    // Ativa loading: desativa inputs e mostra spinner
    setIsLoading(true);
    
    try {
      // Chama endpoint PUT /api/auth/update-password
      const response = await authAPI.updatePassword(currentPw, newPw);

      if (response.success) {
        // SUCESSO: Mostra notificação verde e fecha modal
        showToast('Password alterada com sucesso!', 'success');
        handleClose();
      } else {
        // ERRO DA API: Mostra mensagem (ex: password atual incorreta)
        setCurrentPasswordError(response.message || 'Erro ao alterar password');
      }
    } catch (error) {
      // ERRO DE REDE: Servidor offline ou outro erro
      const errorMsg = error.response?.data?.message || 'Erro ao conectar ao servidor';
      
      // Determina onde mostrar erro baseado na mensagem
      // Se menciona "atual" ou "incorreta", mostra no campo atual
      if (errorMsg.toLowerCase().includes('atual') || errorMsg.toLowerCase().includes('incorreta')) {
        setCurrentPasswordError(errorMsg);
      } else {
        // Erro genérico: mostra no campo atual
        setCurrentPasswordError(errorMsg);
      }
    } finally {
      // Sempre desativa loading (sucesso ou erro)
      setIsLoading(false);
    }
  };

  // ==========================================
  // FUNÇÃO: handleClose
  // ==========================================
  // O QUÊ: Fecha modal e limpa todos os campos
  // PORQUÊ: Resetar estado para próxima abertura
  // COMO:
  //   1. Limpa valores dos inputs (refs)
  //   2. Limpa todas as mensagens de erro
  //   3. Chama onClose() (callback do pai)
  const handleClose = () => {
    // Limpar valores dos campos (se refs existirem)
    if (currentPasswordRef.current) currentPasswordRef.current.value = '';
    if (newPasswordRef.current) newPasswordRef.current.value = '';
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    
    // Limpar todas as mensagens de erro
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    
    // Chamar callback do componente pai para fechar modal
    onClose();
  };

  // ==========================================
  // FUNÇÃO: handleKeyPress
  // ==========================================
  // O QUÊ: Permite submeter com tecla Enter
  // PORQUÊ: Melhorar UX - não precisa usar rato
  // NOTA: Só funciona se não estiver em loading
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  // Se modal não está aberto, não renderiza nada
  if (!isOpen) return null;

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    // Overlay: fundo semi-transparente
    <div className="modal-overlay" onClick={handleClose}>
      {/* Conteúdo do modal - stopPropagation previne fechar ao clicar dentro */}
      <div className="modal-content change-password-modal" onClick={(e) => e.stopPropagation()}>
        {/* Botão fechar (×) no canto superior direito */}
        <button className="modal-close" onClick={handleClose}>×</button>
        
        {/* Título do modal */}
        <h2 className="modal-title">Alterar Password</h2>
        
        {/* ------------------------------------------
            FORMULÁRIO
            ------------------------------------------ */}
        <div className="modal-body">
          {/* Campo 1: Password Atual */}
          <div className="input-group">
            <label className="label">Password Atual</label>
            <input
              ref={currentPasswordRef}
              type="password"
              className={`input ${currentPasswordError ? 'input-error' : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
              onKeyPress={handleKeyPress}
            />
            {/* Mensagem de erro (só aparece se houver) */}
            {currentPasswordError && <span className="error-message">{currentPasswordError}</span>}
          </div>

          {/* Campo 2: Nova Password */}
          <div className="input-group">
            <label className="label">Nova Password</label>
            <input
              ref={newPasswordRef}
              type="password"
              className={`input ${newPasswordError ? 'input-error' : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
              onKeyPress={handleKeyPress}
            />
            {newPasswordError && <span className="error-message">{newPasswordError}</span>}
          </div>

          {/* Campo 3: Confirmar Nova Password */}
          <div className="input-group">
            <label className="label">Confirmar Nova Password</label>
            <input
              ref={confirmPasswordRef}
              type="password"
              className={`input ${confirmPasswordError ? 'input-error' : ''}`}
              placeholder="••••••••"
              disabled={isLoading}
              onKeyPress={handleKeyPress}
            />
            {confirmPasswordError && <span className="error-message">{confirmPasswordError}</span>}
          </div>
        </div>

        {/* ------------------------------------------
            BOTÕES DE AÇÃO
            ------------------------------------------ */}
        <div className="modal-actions">
          {/* Botão Cancelar */}
          <button 
            onClick={handleClose} 
            className="modal-button modal-button-cancel"
            disabled={isLoading}
          >
            Cancelar
          </button>
          
          {/* Botão Alterar Password (com loading) */}
          <button 
            onClick={handleSubmit} 
            className="modal-button modal-button-confirm"
            disabled={isLoading}
          >
            {isLoading ? (
              // Estado loading: spinner + texto
              <span className="button-loading">
                <span className="spinner"></span>
                A alterar...
              </span>
            ) : (
              // Estado normal: texto simples
              'Alterar Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
