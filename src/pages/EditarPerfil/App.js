import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/App';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import '../../styles/App.css';

const EditarPerfilPage = ({ setCurrentPage, showToast, onLogout }) => {
  const { user, updateUser } = useAuth();
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState('');
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');
  const [errors, setErrors] = useState({});

  // Carregar dados do utilizador
  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setEmail(user.email || '');
      setTipo(user.tipo || '');
    }
  }, [user]);

  // Validar formulário
  const validateForm = () => {
    const newErrors = {};

    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar alterações
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});

      const response = await authAPI.updateProfile({
        nome: nome.trim(),
        email: email.trim(),
      });

      if (response.success) {
        // Atualizar contexto de autenticação com dados retornados pelo backend
        const updatedUser = response.data.user;
        const newToken = response.data.token;
        
        localStorage.setItem('token', newToken);
        updateUser(updatedUser);

        showToast('Perfil atualizado com sucesso!', 'success');
        setTimeout(() => {
          setCurrentPage('perfil');
        }, 500);
      } else {
        showToast(response.message || 'Erro ao atualizar perfil', 'error');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      
      if (error.response?.data?.message) {
        showToast(error.response.data.message, 'error');
      } else if (error.response?.status === 400) {
        showToast('Email já está em uso', 'error');
      } else {
        showToast('Erro ao atualizar perfil. Tente novamente.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar conta
  const handleDeleteAccount = async () => {
    // Validar password
    if (!confirmPassword.trim()) {
      setDeletePasswordError('Password é obrigatória');
      return;
    }

    try {
      setIsLoading(true);
      setDeletePasswordError('');
      
      const response = await authAPI.deleteAccount(confirmPassword);

      if (response.success) {
        showToast('Conta eliminada com sucesso', 'success');
        setDeleteModalOpen(false);
        setConfirmPassword('');
        setTimeout(() => {
          onLogout();
          setCurrentPage('login');
        }, 1000);
      } else {
        setDeletePasswordError(response.message || 'Erro ao eliminar conta');
      }
    } catch (error) {
      console.error('Erro ao eliminar conta:', error);
      
      if (error.response?.data?.message) {
        setDeletePasswordError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setDeletePasswordError('Password incorreta');
      } else {
        setDeletePasswordError('Erro ao eliminar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar e voltar
  const handleCancel = () => {
    setCurrentPage('perfil');
  };

  // Fechar modal de eliminação
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setConfirmPassword('');
    setDeletePasswordError('');
  };

  // Formatar tipo de utilizador
  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'aluno': return 'Aluno';
      case 'professor': return 'Professor';
      case 'bibliotecario': return 'Bibliotecário(a)';
      default: return tipo;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="catalog-container">
      <Header activePage="perfil" setCurrentPage={setCurrentPage} />
      
      <main className="catalog-main" role="main">
        <h1 className="catalog-title">EDITAR PERFIL</h1>
        
        <div className="details-box">
          <div className="profile-header">
            <div className="profile-icon">👤</div>
          </div>
          
          <div className="editar-perfil-form">
            {/* Campo Nome */}
            <div className="form-field">
              <label htmlFor="nome">Nome Completo</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={errors.nome ? 'input input-error' : 'input'}
                disabled={isLoading}
                placeholder="Digite seu nome completo"
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>

            {/* Campo Email */}
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'input input-error' : 'input'}
                disabled={isLoading}
                placeholder="Digite seu email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Campo Tipo (read-only) */}
            <div className="form-field">
              <label htmlFor="tipo">Tipo de Utilizador</label>
              <div className="tipo-display">
                <span className="badge badge-available">
                  {getTipoLabel(tipo)}
                </span>
                <span className="tipo-info">Não pode ser alterado</span>
              </div>
            </div>

            {/* Botões de ação */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                className="profile-button" 
                onClick={handleCancel}
                disabled={isLoading}
                style={{ backgroundColor: '#f5f5f5', color: '#666', width: 'auto', minWidth: '150px' }}
              >
                Cancelar
              </button>
              <button 
                className="profile-button" 
                onClick={handleSave}
                disabled={isLoading}
                style={{ width: 'auto', minWidth: '200px' }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Guardando...
                  </>
                ) : (
                  'Guardar Alterações'
                )}
              </button>
            </div>
          </div>

          {/* Zona de perigo */}
          <div className="danger-zone">
            <h3>Zona de Perigo</h3>
            <p>A eliminação da conta é permanente e não pode ser revertida.</p>
            <button 
              className="btn-delete" 
              onClick={() => setDeleteModalOpen(true)}
              disabled={isLoading}
            >
              Eliminar Conta
            </button>
          </div>
        </div>
      </main>

      {/* Modal de confirmação de eliminação */}
      {deleteModalOpen && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseDeleteModal}>×</button>
            
            <h2 className="modal-title">Eliminar Conta</h2>
            <p className="modal-message">
              Tem a certeza que deseja eliminar a sua conta? Esta ação é irreversível e todos os seus dados serão permanentemente removidos.
            </p>
            
            <div className="modal-password-field">
              <label htmlFor="confirm-password">Confirme a sua password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={deletePasswordError ? 'error' : ''}
                placeholder="Digite a sua password"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleDeleteAccount()}
              />
              {deletePasswordError && (
                <span className="error-message">{deletePasswordError}</span>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={handleCloseDeleteModal}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                className="btn-delete-confirm" 
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Eliminando...
                  </>
                ) : (
                  'Sim, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarPerfilPage;
