// ==========================================
// PÁGINA INICIAL - BOOKTRACK
// ==========================================
// Esta é a página de boas-vindas que aparece após o login
// Apresenta:
// - 👋 Mensagem de boas-vindas
// - 📖 Descrição breve do sistema
// - 🔘 Botões rápidos para explorar catálogo ou ver perfil
//
// É uma landing page simples para orientar o utilizador

import React from 'react';
import Header from '../../components/Header/App';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - InicioPage
// ==========================================
// Componente funcional simples (sem estado)
// Usa arrow function direto no return
const InicioPage = ({ setCurrentPage }) => (
  <div className="catalog-container">
    {/* Cabeçalho com navegação (destaca "inicio" no menu) */}
    <Header activePage="inicio" setCurrentPage={setCurrentPage} />
    
    <main className="catalog-main" role="main">
      {/* ------------------------------------------
          SECÇÃO HERO (Principal)
          ------------------------------------------
          Área de destaque com título, descrição e botões de ação
      */}
      <div className="hero-section">
        {/* Título principal da página */}
        <h1 className="hero-title">BEM-VINDO À BIBLIOTECA</h1>
        
        {/* Descrição do sistema */}
        <div className="hero-description">
          <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
            Explore o nosso vasto catálogo de livros, faça reservas online e acompanhe o seu histórico de leituras. 
            O BookTrack torna a gestão da biblioteca escolar mais fácil e acessível para todos.
          </p>
        </div>
        
        {/* ------------------------------------------
            BOTÕES DE ACÇÃO RÁPIDA
            ------------------------------------------
            Atalhos para as páginas mais usadas
        */}
        <div className="hero-buttons">
          {/* Botão primário: Ir para catálogo de livros */}
          <button 
            onClick={() => setCurrentPage('catalogo')} 
            className="primary-button"
          >
            Explorar Catálogo
          </button>
          
          {/* Botão secundário: Ir para perfil do utilizador */}
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
