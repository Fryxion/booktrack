import React from 'react';
import Header from '../../components/Header/App';
import '../../styles/App.css';

const InicioPage = ({ setCurrentPage }) => (
  <div className="catalog-container">
    <Header activePage="inicio" setCurrentPage={setCurrentPage} />
    
    <main className="catalog-main" role="main">
      <div className="hero-section">
        <h1 className="hero-title">BEM-VINDO À BIBLIOTECA</h1>
        <div className="hero-description">
          <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
            Explore o nosso vasto catálogo de livros, faça reservas online e acompanhe o seu histórico de leituras. 
            O BookTrack torna a gestão da biblioteca escolar mais fácil e acessível para todos.
          </p>
        </div>
        <div className="hero-buttons">
          <button 
            onClick={() => setCurrentPage('catalogo')} 
            className="primary-button"
          >
            Explorar Catálogo
          </button>
          <button 
            onClick={() => setCurrentPage('perfil')} 
            className="secondary-button"
          >
            Meu Perfil
          </button>
        </div>
      </div>
    </main>
  </div>
);

export default InicioPage;
