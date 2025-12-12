import React from 'react';
import Header from '../../components/Header/App';
import islaEntrada from '../../assets/images/isla-entrada.jpg';
import '../../styles/App.css';

const SobrePage = ({ setCurrentPage }) => (
  <div className="catalog-container">
    <Header activePage="sobre" setCurrentPage={setCurrentPage} />
    
    <main className="catalog-main" role="main">
      <h1 className="catalog-title">SOBRE NÓS</h1>
      
      <div className="details-box">
        <div className="about-section">
          <div className="about-image">
            <img src={islaEntrada} alt="ISLA Gaia" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
          </div>
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
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d328.30859871337276!2d-8.6145598466295!3d41.124247342605365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2464dcf46cd243%3A0x848698c37047218b!2sISLA%20Gaia!5e0!3m2!1spt-PT!2spt!4v1765553275720!5m2!1spt-PT!2spt" 
              width="100%" 
              height="350" 
              style={{ border: 0, borderRadius: '8px' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização ISLA Gaia"
            ></iframe>
          </div>
          <p style={{ marginTop: '1rem', color: '#6b7280', textAlign: 'center', fontSize: '0.95rem' }}>
            📍 Biblioteca ISLA Gaia<br/>
            R. Diogo Macedo 192, 4400-107 Vila Nova de Gaia
          </p>
        </div>
      </div>
    </main>
  </div>
);

export default SobrePage;
