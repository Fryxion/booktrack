import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/App';
import { useAuth } from '../../contexts/AuthContext';
import { emprestimosAPI } from '../../services/api';
import '../../styles/App.css';

const PerfilPage = ({ setCurrentPage, onEditProfile, onChangePassword, onLogout }) => {
  const { user } = useAuth();
  const [historicoEmprestimos, setHistoricoEmprestimos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistorico();
  }, []);

  const loadHistorico = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await emprestimosAPI.getHistorico();
      
      if (response.success) {
        setHistoricoEmprestimos(response.data);
      } else {
        setError(response.message || 'Erro ao carregar histórico');
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError('Erro ao conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
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
        <h1 className="catalog-title">PERFIL</h1>
        
        <div className="details-box">
          <div className="profile-header">
            <div className="profile-icon">👤</div>
            <h2 className="profile-name">{user.nome}</h2>
            <p className="profile-email">{user.email}</p>
            <span className="badge badge-available" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {getTipoLabel(user.tipo)}
            </span>
          </div>

          <div className="profile-actions">
            <button className="profile-button" onClick={onEditProfile}>
              Editar perfil
            </button>
            <button className="profile-button" onClick={onChangePassword}>
              Alterar password
            </button>
            <button 
              onClick={() => setCurrentPage('reservas')} 
              className="profile-button"
            >
              Consultar reservas
            </button>
            <button 
              onClick={onLogout}
              className="logout-button"
            >
              Log out
            </button>
          </div>

          <div className="history-section">
            <h3 className="history-title">Histórico de Empréstimos</h3>
            
            {loading ? (
              <div className="empty-state">
                <div className="spinner"></div>
                <p>A carregar histórico...</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <p style={{ color: '#ef4444' }}>{error}</p>
                <button className="secondary-button" onClick={loadHistorico}>
                  Tentar novamente
                </button>
              </div>
            ) : historicoEmprestimos.length === 0 ? (
              <div className="empty-state">
                <p>Ainda não tem empréstimos registados.</p>
              </div>
            ) : (
              historicoEmprestimos.map((emp) => (
                <div key={emp.id_emprestimo} className="reserva-card">
                  <div className="small-cover">📚</div>
                  <div className="reserva-info">
                    <h4 className="reserva-title">
                      {emp.titulo || 'Título não disponível'}
                    </h4>
                    <p className="book-detail">Autor: {emp.autor || 'N/A'}</p>
                    <p className="book-detail">ISBN: {emp.isbn_livro}</p>
                    <p className="book-detail">Empréstimo: {formatDate(emp.data_emprestimo)}</p>
                    <p className="book-detail">
                      Devolução Prevista: {formatDate(emp.data_devolucao_prevista)}
                    </p>
                    <p className="book-detail">
                      Devolução Efetiva: {emp.data_devolucao_efetiva ? formatDate(emp.data_devolucao_efetiva) : '-'}
                    </p>
                    <p className="book-detail">
                      Multa: {emp.multa}€
                    </p>
                    <div style={{ marginTop: '0.5rem' }}>
                      {emp.estado === 'ativo' && (
                        <span className="badge badge-available">Ativo</span>
                      )}
                      {emp.estado === 'devolvido' && (
                        <span className="badge" style={{ 
                          backgroundColor: '#dbeafe', 
                          color: '#1e40af' 
                        }}>Devolvido</span>
                      )}
                      {emp.estado === 'atrasado' && (
                        <span className="badge badge-unavailable">Atrasado</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PerfilPage;
