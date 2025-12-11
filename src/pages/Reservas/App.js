import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/App';
import { reservasAPI } from '../../services/api';
import '../../styles/App.css';

const ReservasPage = ({ setCurrentPage, showToast, onCancelarReserva }) => {
  const [reservasAtivas, setReservasAtivas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reservasAPI.getMinhas();
      
      if (response.success) {
        setReservasAtivas(response.data);
      } else {
        setError(response.message || 'Erro ao carregar reservas');
      }
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
      setError('Erro ao conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarReserva = async (id, titulo) => {
    // Confirmar com o utilizador
    if (window.confirm(`Tem certeza que deseja cancelar a reserva do livro "${titulo}"?`)) {
      try {
        const response = await reservasAPI.cancelar(id);
        
        if (response.success) {
          showToast('Reserva cancelada com sucesso!', 'success');
          // Remover da lista local
          setReservasAtivas(reservasAtivas.filter(r => r.id_reserva !== id));
        } else {
          showToast(response.message || 'Erro ao cancelar reserva', 'error');
        }
      } catch (err) {
        console.error('Erro ao cancelar reserva:', err);
        const message = err.response?.data?.message || 'Erro ao cancelar reserva';
        showToast(message, 'error');
      }
    }
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
  };

  // Obter cor do estado
  const getEstadoBadge = (estado) => {
    switch(estado) {
      case 'pendente':
        return <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Pendente</span>;
      case 'confirmada':
        return <span className="badge badge-available">Confirmada</span>;
      case 'cancelada':
        return <span className="badge badge-unavailable">Cancelada</span>;
      case 'expirada':
        return <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#7f1d1d' }}>Expirada</span>;
      default:
        return <span className="badge">{estado}</span>;
    }
  };

  return (
    <div className="catalog-container">
      <Header activePage="perfil" setCurrentPage={setCurrentPage} />
      
      <main className="catalog-main" role="main">
        <h1 className="catalog-title">MINHAS RESERVAS</h1>
        
        <div className="details-box">
          {loading ? (
            <div className="empty-state">
              <div className="spinner"></div>
              <p>A carregar reservas...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <p style={{ color: '#ef4444' }}>{error}</p>
              <button className="secondary-button" onClick={loadReservas}>
                Tentar novamente
              </button>
            </div>
          ) : reservasAtivas.length === 0 ? (
            <div className="empty-state">
              <p>Não tem reservas ativas.</p>
              <button 
                className="primary-button" 
                onClick={() => setCurrentPage('catalogo')}
                style={{ marginTop: '1rem' }}
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            reservasAtivas.map((reserva) => (
              <div key={reserva.id_reserva} className="reserva-card">
                <div className="small-cover">📚</div>
                <div className="reserva-info">
                  <h4 className="reserva-title">
                    {reserva.titulo || 'Título não disponível'}
                  </h4>
                  <p className="book-detail">Autor: {reserva.autor || 'N/A'}</p>
                  <p className="book-detail">ISBN: {reserva.isbn}</p>
                  <p className="book-detail">Data de Reserva: {formatDate(reserva.data_reserva)}</p>
                  <p className="book-detail">Data de Expiração: {formatDate(reserva.data_expiracao)}</p>
                  <div style={{ marginTop: '0.5rem' }}>
                    {getEstadoBadge(reserva.estado)}
                  </div>
                </div>
                {(reserva.estado === 'pendente' || reserva.estado === 'confirmada') && (
                  <button 
                    onClick={() => handleCancelarReserva(reserva.id_reserva, reserva.titulo)}
                    className="cancel-button"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            ))
          )}
          
          <div className="back-section">
            <button 
              onClick={() => setCurrentPage('perfil')}
              className="back-button"
            >
              Voltar ao Perfil
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReservasPage;
