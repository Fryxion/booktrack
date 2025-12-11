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
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Nossa Missão
            </h2>
            <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: '1rem' }}>
              O BookTrack é um sistema de gestão de biblioteca escolar desenvolvido para tornar o acesso aos livros mais fácil e eficiente.
            </p>
            <p style={{ color: '#6b7280', lineHeight: 1.7 }}>
              Nossa missão é promover a leitura e facilitar a descoberta de novas obras para toda a comunidade escolar, 
              proporcionando uma experiência simples e intuitiva de consulta ao catálogo.
            </p>
          </div>
        </div>

        <div className="map-section">
          <h2 className="section-title">Onde estamos localizados</h2>
          <div className="map-placeholder">🗺️</div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>
            Biblioteca Escolar - Rua Exemplo, 123 - Porto, Portugal
          </p>
        </div>
      </div>
    </main>
  </div>
);

export default SobrePage;
