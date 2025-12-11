import React from 'react';
import Header from '../../components/Header/App';
import '../../styles/App.css';

const SobrePage = ({ setCurrentPage }) => (
  <div className="catalog-container">
    <Header activePage="sobre" setCurrentPage={setCurrentPage} />
    
    <main className="catalog-main" role="main">
      <h1 className="catalog-title">SOBRE NÓS</h1>
      
      <div className="details-box">
        <div className="about-section">
          <div className="about-image">🏫</div>
          <div className="about-content">
            <textarea 
              className="textarea"
              placeholder="Lorem ipsum..."
              value="O BookTrack é um sistema de gestão de biblioteca escolar desenvolvido para tornar o acesso aos livros mais fácil e eficiente. Nossa missão é promover a leitura e facilitar o processo de empréstimo de livros para toda a comunidade escolar."
              readOnly
            />
          </div>
        </div>

        <div className="map-section">
          <h2 className="section-title">Onde estamos localizados</h2>
          <div className="map-placeholder">🗺️</div>
        </div>
      </div>
    </main>
  </div>
);

export default SobrePage;
