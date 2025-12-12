import React, { useState, useRef } from 'react';
import { authAPI } from '../../services/api';
import '../../styles/App.css';

const ChangePasswordModal = ({ isOpen, onClose, showToast }) => {
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleSubmit = async () => {
    // Limpar erros
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    // Ler valores
    const currentPw = currentPasswordRef.current?.value || '';
    const newPw = newPasswordRef.current?.value || '';
    const confirmPw = confirmPasswordRef.current?.value || '';

    // Validações
    if (!currentPw) {
      setCurrentPasswordError('Password atual é obrigatória');
      return;
    }

    if (!newPw) {
      setNewPasswordError('Nova password é obrigatória');
      return;
    }

    if (newPw.length < 6) {
      setNewPasswordError('Nova password deve ter pelo menos 6 caracteres');
      return;
    }

    if (!confirmPw) {
      setConfirmPasswordError('Confirmação de password é obrigatória');
      return;
    }

    if (newPw !== confirmPw) {
      setConfirmPasswordError('As passwords não coincidem');
      return;
    }

    if (currentPw === newPw) {
      setNewPasswordError('Nova password deve ser diferente da atual');
      return;
    }

    // Chamar API
    setIsLoading(true);
    try {
      const response = await authAPI.updatePassword(currentPw, newPw);

      if (response.success) {
        showToast('Password alterada com sucesso!', 'success');
        handleClose();
      } else {
        setCurrentPasswordError(response.message || 'Erro ao alterar password');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erro ao conectar ao servidor';
      
      // Determinar qual campo mostrar o erro
      if (errorMsg.toLowerCase().includes('atual') || errorMsg.toLowerCase().includes('incorreta')) {
        setCurrentPasswordError(errorMsg);
      } else {
        setCurrentPasswordError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Limpar campos
    if (currentPasswordRef.current) currentPasswordRef.current.value = '';
    if (newPasswordRef.current) newPasswordRef.current.value = '';
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    
    // Limpar erros
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content change-password-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>
        
        <h2 className="modal-title">Alterar Password</h2>
        
        <div className="modal-body">
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
            {currentPasswordError && <span className="error-message">{currentPasswordError}</span>}
          </div>

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

        <div className="modal-actions">
          <button 
            onClick={handleClose} 
            className="modal-button modal-button-cancel"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit} 
            className="modal-button modal-button-confirm"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="button-loading">
                <span className="spinner"></span>
                A alterar...
              </span>
            ) : (
              'Alterar Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
