import React from 'react';
import Header from '../../components/Header/App';
import '../../styles/App.css';

const InicioPage = ({ setCurrentPage }) => (
  <div className="catalog-container">
    <Header activePage="inicio" setCurrentPage={setCurrentPage} />
    
    <main className="catalog-main" role="main">
      <div className="hero-section">
        <h1 className="hero-title">BEM VINDO À LIVRARIA</h1>
        <div className="hero-description">
          <textarea 
            className="textarea"
            placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Descubra nossa coleção de livros e reserve os seus favoritos de forma simples e rápida."
            readOnly
            value="Explore o nosso vasto catálogo de livros, faça reservas online e acompanhe o seu histórico de leituras. O BookTrack torna a gestão da biblioteca escolar mais fácil e acessível para todos."
          />
        </div>
        <div className="hero-buttons">
          <button 
            onClick={() => setCurrentPage('catalogo')} 
            className="primary-button"
          >
            Pesquisar
          </button>
          <button 
            onClick={() => setCurrentPage('perfil')} 
            className="secondary-button"
          >
            Reservar
          </button>
        </div>
      </div>
    </main>
  </div>
);

export default InicioPage;
