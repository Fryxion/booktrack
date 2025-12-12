import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import Modal from '../../components/Modal/App';
import './App.css';

const EditarPerfilPage = ({ setCurrentPage, showToast, onLogout }) => {
  const { user, login } = useAuth();
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState('');
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
        // Atualizar contexto de autenticação
        const updatedUser = { ...user, nome: nome.trim(), email: email.trim() };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        login(response.token, updatedUser);

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
    try {
      setIsLoading(true);
      const response = await authAPI.deleteAccount();

      if (response.success) {
        showToast('Conta eliminada com sucesso', 'success');
        setDeleteModalOpen(false);
        setTimeout(() => {
          onLogout();
          setCurrentPage('login');
        }, 1000);
      } else {
        showToast(response.message || 'Erro ao eliminar conta', 'error');
      }
    } catch (error) {
      console.error('Erro ao eliminar conta:', error);
      showToast('Erro ao eliminar conta. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar e voltar
  const handleCancel = () => {
    setCurrentPage('perfil');
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
    <div className="editar-perfil-container">
      <div className="editar-perfil-header">
        <button className="btn-back" onClick={handleCancel}>
          ← Voltar
        </button>
        <h1 className="editar-perfil-title">EDITAR PERFIL</h1>
      </div>

      <div className="editar-perfil-content">
        <div className="editar-perfil-card">
          <div className="profile-icon-large">👤</div>
          
          <div className="editar-perfil-form">
            {/* Campo Nome */}
            <div className="form-field">
              <label htmlFor="nome">Nome Completo</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={errors.nome ? 'error' : ''}
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
                className={errors.email ? 'error' : ''}
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
            <div className="form-actions">
              <button 
                className="btn-cancel" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                className="btn-save" 
                onClick={handleSave}
                disabled={isLoading}
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
      </div>

      {/* Modal de confirmação de eliminação */}
      <Modal 
        isOpen={deleteModalOpen}
        title="Eliminar Conta"
        message="Tem a certeza que deseja eliminar a sua conta? Esta ação é irreversível e todos os seus dados serão permanentemente removidos."
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModalOpen(false)}
        confirmText="Sim, eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default EditarPerfilPage;
