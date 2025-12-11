import React from 'react';
import Header from '../../components/Header/App';
import '../../styles/App.css';

const ReservasPage = ({ reservasAtivas, handleCancelarReserva, setCurrentPage }) => (
  <div className="catalog-container">
    <Header activePage="perfil" setCurrentPage={setCurrentPage} />
    
    <main className="catalog-main" role="main">
      <h1 className="catalog-title">RESERVAS</h1>
      
      <div className="details-box">
        {reservasAtivas.map((reserva) => (
          <div key={reserva.id} className="reserva-card">
            <div className="small-cover">📚</div>
            <div className="reserva-info">
              <h4 className="reserva-title">
                {reserva.livro}
              </h4>
              <p className="book-detail">Autor: {reserva.autor}</p>
              <p className="book-detail">Data de Reserva: {reserva.dataReserva}</p>
              <p className="book-detail">Data de Expiração: {reserva.dataExpiracao}</p>
            </div>
            <button 
              onClick={() => handleCancelarReserva(reserva.id)}
              className="cancel-button"
            >
              Cancelar
            </button>
          </div>
        ))}
        
        {reservasAtivas.length === 0 && (
          <div className="empty-state">
            <p>Não tem reservas ativas.</p>
          </div>
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

export default ReservasPage;
