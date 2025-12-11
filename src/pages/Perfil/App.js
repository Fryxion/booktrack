import React from 'react';
import Header from '../../components/Header/App';
import '../../styles/App.css';

const PerfilPage = ({ userData, historicoEmprestimos, setCurrentPage }) => (
  <div className="catalog-container">
    <Header activePage="perfil" setCurrentPage={setCurrentPage} />
    
    <main className="catalog-main" role="main">
      <h1 className="catalog-title">PERFIL</h1>
      
      <div className="details-box">
        <div className="profile-header">
          <div className="profile-icon">👤</div>
          <h2 className="profile-name">{userData.nome}</h2>
          <p className="profile-email">{userData.email}</p>
        </div>

        <div className="profile-actions">
          <button className="profile-button">
            Editar perfil
          </button>
          <button className="profile-button">
            Alterar password
          </button>
          <button 
            onClick={() => setCurrentPage('reservas')} 
            className="profile-button"
          >
            Consultar reservas
          </button>
          <button 
            onClick={() => setCurrentPage('login')} 
            className="logout-button"
          >
            Log out
          </button>
        </div>

        <div className="history-section">
          <h3 className="history-title">Histórico</h3>
          {historicoEmprestimos.map((emp) => (
            <div key={emp.id} className="reserva-card">
              <div className="small-cover">📚</div>
              <div className="reserva-info">
                <h4 className="reserva-title">
                  {emp.livro}
                </h4>
                <p className="book-detail">Autor: {emp.autor}</p>
                <p className="book-detail">Empréstimo: {emp.dataEmprestimo}</p>
                <p className="book-detail">Devolução: {emp.dataDevolucao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
);

export default PerfilPage;
