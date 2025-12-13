// ==========================================
// PÁGINA DE EDITAR PERFIL - BOOKTRACK
// ==========================================
// Esta página permite ao utilizador editar os seus dados pessoais:
// - ✏️ Alterar nome e email
// - 👀 Ver tipo de utilizador (não editável)
// - 🗑️ Eliminar conta permanentemente (requer confirmação de password)
// 
// VALIDAÇÕES:
// - Nome: mínimo 3 caracteres
// - Email: formato válido
// - Eliminação: requer password correta

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/App';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - EditarPerfilPage
// ==========================================
const EditarPerfilPage = ({ setCurrentPage, showToast, onLogout }) => {
  // ------------------------------------------
  // CONTEXTO DE AUTENTICAÇÃO
  // ------------------------------------------
  // user = dados do utilizador logado
  // updateUser = função para atualizar dados no contexto
  const { user, updateUser } = useAuth();
  
  // ------------------------------------------
  // ESTADO: DADOS DO FORMULÁRIO
  // ------------------------------------------
  const [nome, setNome] = useState(''); // Nome completo do utilizador
  const [email, setEmail] = useState(''); // Email do utilizador
  const [tipo, setTipo] = useState(''); // Tipo: aluno/professor/bibliotecario (read-only)
  
  // ------------------------------------------
  // ESTADO: CONTROLO DE UI
  // ------------------------------------------
  const [isLoading, setIsLoading] = useState(false); // true = a processar pedido
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // true = modal de eliminação visível
  const [confirmPassword, setConfirmPassword] = useState(''); // Password para confirmar eliminação
  const [deletePasswordError, setDeletePasswordError] = useState(''); // Erro na password de eliminação
  const [errors, setErrors] = useState({}); // Erros de validação do formulário

  // ------------------------------------------
  // EFEITO: CARREGAR DADOS DO UTILIZADOR
  // ------------------------------------------
  // Quando o componente é montado ou user muda,
  // preenche os campos do formulário com os dados atuais
  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setEmail(user.email || '');
      setTipo(user.tipo || '');
    }
  }, [user]); // Executa quando user muda

  // ------------------------------------------
  // FUNÇÃO: VALIDAR FORMULÁRIO
  // ------------------------------------------
  // Verifica se os dados inseridos são válidos antes de enviar ao servidor
  // 
  // VALIDAÇÕES:
  // - Nome: não vazio e mínimo 3 caracteres
  // - Email: não vazio e formato válido (xxx@xxx.xxx)
  // 
  // Retorna: true se válido, false se houver erros
  const validateForm = () => {
    const newErrors = {}; // Objeto para guardar erros encontrados

    // ------------------------------------------
    // VALIDAÇÃO: NOME
    // ------------------------------------------
    if (!nome.trim()) {
      // trim() remove espaços no início e fim
      newErrors.nome = 'Nome é obrigatório';
    } else if (nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    // ------------------------------------------
    // VALIDAÇÃO: EMAIL
    // ------------------------------------------
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      // Regex que valida formato de email
      // ^[^\s@]+ = começa com caracteres (sem espaços nem @)
      // @ = tem arroba
      // [^\s@]+ = domínio (sem espaços nem @)
      // \. = tem ponto
      // [^\s@]+$ = extensão até ao fim
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors); // Guardar erros no estado
    return Object.keys(newErrors).length === 0; // true se não há erros
  };

  // ------------------------------------------
  // FUNÇÃO: GUARDAR ALTERAÇÕES
  // ------------------------------------------
  // Envia os dados atualizados para o servidor
  // 
  // FLUXO:
  // 1. Valida formulário (se inválido, para aqui)
  // 2. Ativa loading
  // 3. Faz pedido PUT /auth/update-profile
  // 4. Se sucesso: atualiza contexto, guarda novo token, mostra toast verde, volta ao perfil
  // 5. Se erro: mostra toast vermelho com mensagem
  // 6. Desativa loading
  const handleSave = async () => {
    // Validar antes de enviar
    if (!validateForm()) {
      return; // Para aqui se houver erros
    }

    try {
      setIsLoading(true); // Mostrar spinner
      setErrors({}); // Limpar erros anteriores

      // Fazer pedido ao servidor
      const response = await authAPI.updateProfile({
        nome: nome.trim(),
        email: email.trim(),
      });

      if (response.success) {
        // ------------------------------------------
        // SUCESSO: ATUALIZAR CONTEXTO
        // ------------------------------------------
        // O backend retorna dados atualizados + novo token JWT
        // (novo token porque o email pode ter mudado)
        const updatedUser = response.data.user;
        const newToken = response.data.token;
        
        // Guardar novo token no navegador
        localStorage.setItem('token', newToken);
        // Atualizar dados do utilizador no contexto (estado global)
        updateUser(updatedUser);

        // Mostrar mensagem de sucesso
        showToast('Perfil atualizado com sucesso!', 'success');
        // Aguardar 500ms e voltar à página de perfil
        setTimeout(() => {
          setCurrentPage('perfil');
        }, 500);
      } else {
        // Servidor retornou erro
        showToast(response.message || 'Erro ao atualizar perfil', 'error');
      }
    } catch (error) {
      // Erro de rede ou servidor offline
      console.error('Erro ao atualizar perfil:', error);
      
      // Tentar mostrar mensagem específica do backend
      if (error.response?.data?.message) {
        showToast(error.response.data.message, 'error');
      } else if (error.response?.status === 400) {
        // 400 = Bad Request, normalmente email duplicado
        showToast('Email já está em uso', 'error');
      } else {
        // Erro genérico
        showToast('Erro ao atualizar perfil. Tente novamente.', 'error');
      }
    } finally {
      // Finally executa SEMPRE
      setIsLoading(false); // Esconder spinner
    }
  };

  // ==========================================
  // GESTÃO DE ELIMINAÇÃO DE CONTA
  // ==========================================
  
  // ------------------------------------------
  // FUNÇÃO: ELIMINAR CONTA
  // ------------------------------------------
  // Remove permanentemente a conta do utilizador da base de dados
  // 
  // SEGURANÇA: Requer confirmação de password
  // 
  // FLUXO:
  // 1. Valida que password foi inserida
  // 2. Faz pedido DELETE /auth/delete-account com password
  // 3. Se sucesso: mostra toast, faz logout, redireciona para login
  // 4. Se erro: mostra mensagem de erro (ex: "Password incorreta")
  const handleDeleteAccount = async () => {
    // ------------------------------------------
    // VALIDAR PASSWORD
    // ------------------------------------------
    if (!confirmPassword.trim()) {
      setDeletePasswordError('Password é obrigatória');
      return; // Para aqui se não inseriu password
    }

    try {
      setIsLoading(true); // Mostrar spinner
      setDeletePasswordError(''); // Limpar erro anterior
      
      // Fazer pedido ao servidor para eliminar conta
      // O servidor vai verificar se a password está correta
      const response = await authAPI.deleteAccount(confirmPassword);

      if (response.success) {
        // ------------------------------------------
        // SUCESSO: CONTA ELIMINADA
        // ------------------------------------------
        showToast('Conta eliminada com sucesso', 'success');
        setDeleteModalOpen(false); // Fechar modal
        setConfirmPassword(''); // Limpar password
        
        // Aguardar 1 segundo para utilizador ver mensagem
        setTimeout(() => {
          onLogout(); // Terminar sessão
          setCurrentPage('login'); // Ir para login
        }, 1000);
      } else {
        // Servidor retornou erro
        setDeletePasswordError(response.message || 'Erro ao eliminar conta');
      }
    } catch (error) {
      console.error('Erro ao eliminar conta:', error);
      
      // Mostrar mensagem de erro específica
      if (error.response?.data?.message) {
        setDeletePasswordError(error.response.data.message);
      } else if (error.response?.status === 401) {
        // 401 = Unauthorized = password incorreta
        setDeletePasswordError('Password incorreta');
      } else {
        setDeletePasswordError('Erro ao eliminar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false); // Esconder spinner
    }
  };

  // ------------------------------------------
  // FUNÇÃO: CANCELAR EDIÇÃO
  // ------------------------------------------
  // Descarta alterações e volta ao perfil sem guardar
  const handleCancel = () => {
    setCurrentPage('perfil');
  };

  // ------------------------------------------
  // FUNÇÃO: FECHAR MODAL DE ELIMINAÇÃO
  // ------------------------------------------
  // Fecha o modal e limpa dados relacionados
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setConfirmPassword('');
    setDeletePasswordError('');
  };

  // ------------------------------------------
  // FUNÇÃO AUXILIAR: FORMATAR TIPO
  // ------------------------------------------
  // Converte tipo de utilizador para texto legível
  // Ex: 'aluno' → 'Aluno', 'bibliotecario' → 'Bibliotecário(a)'
  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'aluno': return 'Aluno';
      case 'professor': return 'Professor';
      case 'bibliotecario': return 'Bibliotecário(a)';
      default: return tipo;
    }
  };

  // ------------------------------------------
  // VALIDAÇÃO: UTILIZADOR AUTENTICADO
  // ------------------------------------------
  // Se não há utilizador logado, não renderiza nada
  if (!user) {
    return null;
  }

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <div className="catalog-container">
      {/* Cabeçalho com navegação (destaca "perfil" no menu) */}
      <Header activePage="perfil" setCurrentPage={setCurrentPage} />
      
      <main className="catalog-main" role="main">
        <h1 className="catalog-title">EDITAR PERFIL</h1>
        
        <div className="details-box">
          {/* ------------------------------------------
              CABEÇALHO DO PERFIL
              ------------------------------------------
              Ícone de utilizador
          */}
          <div className="profile-header">
            <div className="profile-icon">👤</div>
          </div>
          
          {/* ------------------------------------------
              FORMULÁRIO DE EDIÇÃO
              ------------------------------------------
              3 campos: Nome (editável), Email (editável), Tipo (read-only)
          */}
          <div className="editar-perfil-form">
            {/* ------------------------------------------
                CAMPO: NOME COMPLETO
                ------------------------------------------
                Input controlado com validação
                Mostra erro em vermelho se inválido
            */}
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
              {/* Mensagem de erro (só aparece se houver) */}
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>

            {/* ------------------------------------------
                CAMPO: EMAIL
                ------------------------------------------
                Input controlado com validação de formato
            */}
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

            {/* ------------------------------------------
                CAMPO: TIPO DE UTILIZADOR (READ-ONLY)
                ------------------------------------------
                Não pode ser editado pelo utilizador
                Só bibliotecários (admins) podem alterar isto
            */}
            <div className="form-field">
              <label htmlFor="tipo">Tipo de Utilizador</label>
              <div className="tipo-display">
                {/* Badge verde com tipo formatado */}
                <span className="badge badge-available">
                  {getTipoLabel(tipo)}
                </span>
                <span className="tipo-info">Não pode ser alterado</span>
              </div>
            </div>

            {/* ------------------------------------------
                BOTÕES DE AÇÃO
                ------------------------------------------
                Cancelar (cinzento) + Guardar (azul)
                Lado a lado, alinhados à esquerda
            */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              {/* Botão CANCELAR */}
              <button 
                className="profile-button" 
                onClick={handleCancel}
                disabled={isLoading}
                style={{ backgroundColor: '#f5f5f5', color: '#666', width: 'auto', minWidth: '150px' }}
              >
                Cancelar
              </button>
              
              {/* Botão GUARDAR */}
              <button 
                className="profile-button" 
                onClick={handleSave}
                disabled={isLoading}
                style={{ width: 'auto', minWidth: '200px' }}
              >
                {isLoading ? (
                  // Estado de loading: spinner + texto
                  <>
                    <span className="spinner"></span>
                    Guardando...
                  </>
                ) : (
                  // Estado normal
                  'Guardar Alterações'
                )}
              </button>
            </div>
          </div>

          {/* ------------------------------------------
              ZONA DE PERIGO
              ------------------------------------------
              Secção vermelha para ações destrutivas
              Permite eliminar conta permanentemente
          */}
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

      {/* ==========================================
          MODAL DE CONFIRMAÇÃO DE ELIMINAÇÃO
          ==========================================
          Só aparece quando deleteModalOpen = true
          Overlay escuro + janela central
      */}
      {deleteModalOpen && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          {/* ------------------------------------------
              CONTEÚDO DO MODAL
              ------------------------------------------
              stopPropagation impede fechar ao clicar dentro
          */}
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            {/* Botão X para fechar */}
            <button className="modal-close" onClick={handleCloseDeleteModal}>×</button>
            
            {/* Título e mensagem de aviso */}
            <h2 className="modal-title">Eliminar Conta</h2>
            <p className="modal-message">
              Tem a certeza que deseja eliminar a sua conta? Esta ação é irreversível e todos os seus dados serão permanentemente removidos.
            </p>
            
            {/* ------------------------------------------
                CAMPO DE PASSWORD
                ------------------------------------------
                Requer password para confirmar ação destrutiva
            */}
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
              {/* Erro de password (ex: "Password incorreta") */}
              {deletePasswordError && (
                <span className="error-message">{deletePasswordError}</span>
              )}
            </div>
            
            {/* ------------------------------------------
                BOTÕES DO MODAL
                ------------------------------------------
                Cancelar (cinzento) + Confirmar eliminação (vermelho)
            */}
            <div className="modal-actions">
              {/* Botão CANCELAR */}
              <button 
                className="btn-cancel" 
                onClick={handleCloseDeleteModal}
                disabled={isLoading}
              >
                Cancelar
              </button>
              
              {/* Botão ELIMINAR (destrutivo) */}
              <button 
                className="btn-delete-confirm" 
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? (
                  // Loading state
                  <>
                    <span className="spinner"></span>
                    Eliminando...
                  </>
                ) : (
                  // Estado normal
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
