import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/App.css';

const Header = ({ activePage, setCurrentPage }) => {
  const { user } = useAuth();

  return (
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
              onClick={() => setCurrentPage('inicio')} 
              className={activePage === 'inicio' ? 'nav-button-active' : 'nav-button'}
            >
              Início
            </button>
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
            <button 
              onClick={() => setCurrentPage('admin')} 
              className={activePage === 'admin' ? 'nav-button-active' : 'nav-button'}
            >
              ⚙️ Admin
            </button>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Olá, {user.nome.split(' ')[0]}
            </span>
          )}
          <button onClick={() => setCurrentPage('perfil')} className="user-icon">
            👤
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
