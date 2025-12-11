import React from 'react';
import '../../styles/App.css';

const Header = ({ activePage, setCurrentPage }) => (
  <header className="header" role="banner">
    <div className="header-content">
      <div className="header-left">
        <div className="logo" onClick={() => setCurrentPage('inicio')}>
          <img 
            src="/logo-booktrack.png" 
            alt="BookTrack Logo" 
            className="logo-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="logo-fallback">
            <span className="logo-icon">📚</span>
            <span>BookTrack</span>
          </div>
        </div>
        <nav className="nav" role="navigation" aria-label="Menu principal">
          <button 
            onClick={() => setCurrentPage('catalogo')} 
            className={activePage === 'catalogo' ? 'nav-button-active' : 'nav-button'}
          >
            Catálogo
          </button>
          <button 
            onClick={() => setCurrentPage('sobre')} 
            className={activePage === 'sobre' ? 'nav-button-active' : 'nav-button'}
          >
            Sobre nós
          </button>
        </nav>
      </div>
      <button onClick={() => setCurrentPage('perfil')} className="user-icon">
        👤
      </button>
    </div>
  </header>
);

export default Header;
