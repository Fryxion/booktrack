// ==========================================
// COMPONENTE: Header
// ==========================================
// Este é o cabeçalho global da aplicação
// Aparece em todas as páginas (exceto Login/Registo)
//
// FUNCIONALIDADES:
// - 📜Logo clicável (volta ao Início)
// - 🧭 Navegação principal (Início, Catálogo, Sobre, Admin)
// - 👤 Ícone de perfil (vai para página de perfil)
// - 👋 Saudação personalizada ("Olá, [Nome]")
// - ⚡ Destaque visual da página ativa
// - 🔒 Botão Admin só visível para bibliotecários
//
// PROPS:
// - activePage: String com página atual ('inicio', 'catalogo', etc)
// - setCurrentPage: Função para mudar de página
//
// NOTAS:
// - Logo tem fallback (se imagem falhar, mostra emoji 📚)
// - Botão Admin usa display:none/flex baseado no tipo de utilizador

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificacoesDropdown from '../Notificacoes/NotificacoesDropdown';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - Header
// ==========================================
const Header = ({ activePage, setCurrentPage }) => {
  // Buscar dados do utilizador autenticado do contexto
  const { user } = useAuth();

  return (
    <header className="header" role="banner">
      <div className="header-content">
        {/* ------------------------------------------
            LADO ESQUERDO: Logo + Navegação
            ------------------------------------------ */}
        <div className="header-left">
          {/* ------------------------------------------
              LOGO
              ------------------------------------------
              Clicável: volta para página inicial
              Tem fallback: se imagem falhar, mostra emoji + texto
          */}
          <div className="logo" onClick={() => setCurrentPage('inicio')}>
            {/* Imagem do logo (carregada de /public) */}
            <img 
              src="/logo-booktrack.png" 
              alt="BookTrack Logo" 
              className="logo-image"
              onError={(e) => {
                // Se imagem falhar ao carregar:
                // 1. Esconde a imagem
                e.target.style.display = 'none';
                // 2. Mostra o fallback (próximo elemento)
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback do logo (emoji + texto) */}
            <div className="logo-fallback">
              <span className="logo-icon">📚</span>
              <span>BookTrack</span>
            </div>
          </div>
          
          {/* ------------------------------------------
              NAVEGAÇÃO PRINCIPAL
              ------------------------------------------
              Botões para diferentes páginas
              Classe condicional: 'nav-button-active' se for página atual
          */}
          <nav className="nav" role="navigation" aria-label="Menu principal">
            {/* Botão Início */}
            <button 
              onClick={() => setCurrentPage('inicio')} 
              className={activePage === 'inicio' ? 'nav-button-active' : 'nav-button'}
            >
              Início
            </button>
            
            {/* Botão Catálogo */}
            <button 
              onClick={() => setCurrentPage('catalogo')} 
              className={activePage === 'catalogo' ? 'nav-button-active' : 'nav-button'}
            >
              Catálogo
            </button>
            
            {/* Botão Sobre nós */}
            <button 
              onClick={() => setCurrentPage('sobre')} 
              className={activePage === 'sobre' ? 'nav-button-active' : 'nav-button'}
            >
              Sobre nós
            </button>
            
            {/* ------------------------------------------
                BOTÃO ADMIN
                ------------------------------------------
                SÓ VISÍVEL PARA BIBLIOTECÁRIOS
                Usa display inline baseado no tipo de utilizador
            */}
            <button 
              onClick={() => setCurrentPage('admin')} 
              className={activePage === 'admin' ? 'nav-button-active' : 'nav-button'}
              style={user.tipo === 'bibliotecario' ? {display:'flex'} : {display:'none'}}
            >
              ⚙️ Admin
            </button>
          </nav>
        </div>
        
        {/* ------------------------------------------
            LADO DIREITO: Saudação + Ícone de perfil
            ------------------------------------------ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Saudação personalizada */}
          {user && (
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {/* Mostra só o primeiro nome (split por espaço) */}
              Olá, {user.nome.split(' ')[0]}
            </span>
          )}

          <NotificacoesDropdown />
          
          {/* Ícone de utilizador - vai para página de perfil */}
          <button onClick={() => setCurrentPage('perfil')} className="user-icon">
            👤
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
