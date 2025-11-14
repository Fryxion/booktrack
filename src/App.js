import React, { useState } from 'react';

const BookTrackPrototype = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Adicionar font do Google Fonts
  React.useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);
  
  // Mock user data
  const userData = {
    nome: 'José Saramago',
    email: 'josesaramago@gmail.com',
    tipo: 'Professor',
    dataRegisto: '15/09/2025'
  };

  // Mock reservas ativas
  const reservasAtivas = [
    {
      id: 1,
      livro: 'Os Lusíadas',
      autor: 'Luís de Camões',
      dataReserva: '10/11/2025',
      dataExpiracao: '17/11/2025'
    },
    {
      id: 2,
      livro: 'Memorial do Convento',
      autor: 'José Saramago',
      dataReserva: '12/11/2025',
      dataExpiracao: '19/11/2025'
    }
  ];

  // Mock histórico de empréstimos
  const historicoEmprestimos = [
    {
      id: 1,
      livro: 'Mensagem',
      autor: 'Fernando Pessoa',
      dataEmprestimo: '01/10/2025',
      dataDevolucao: '15/10/2025'
    },
    {
      id: 2,
      livro: 'A Cidade e as Serras',
      autor: 'Eça de Queirós',
      dataEmprestimo: '20/09/2025',
      dataDevolucao: '04/10/2025'
    }
  ];

  const books = [
    {
      id: 1,
      title: 'Os Lusíadas',
      author: 'Luís de Camões',
      publicacao: '1572',
      categoria: 'Poesia Épica',
      disponivel: true,
      descricao: 'Epopeia que narra os feitos dos navegadores portugueses, principalmente Vasco da Gama na descoberta do caminho marítimo para a Índia.'
    },
    {
      id: 2,
      title: 'Memorial do Convento',
      author: 'José Saramago',
      publicacao: '1982',
      categoria: 'Romance Histórico',
      disponivel: true,
      descricao: 'Romance histórico sobre a construção do Convento de Mafra no século XVIII.'
    },
    {
      id: 3,
      title: 'Mensagem',
      author: 'Fernando Pessoa',
      publicacao: '1934',
      categoria: 'Poesia',
      disponivel: false,
      descricao: 'Obra poética sobre a história e o destino de Portugal.'
    },
    {
      id: 4,
      title: 'A Cidade e as Serras',
      author: 'Eça de Queirós',
      publicacao: '1901',
      categoria: 'Romance',
      disponivel: true,
      descricao: 'Romance que contrasta a vida na cidade de Paris com a vida rural nas serras portuguesas.'
    }
  ];

  const styles = {
    // Cores da paleta BookTrack
    colors: {
      primary: '#2563EB',      // Azul vibrante
      primaryDark: '#1E40AF',  // Azul escuro
      primaryLight: '#60A5FA', // Azul claro
      success: '#059669',      // Verde (disponível)
      danger: '#DC2626',       // Vermelho (cancelar/erro)
      textDark: '#1F2937',     // Texto principal
      textMuted: '#6B7280',    // Texto secundário
      bgLight: '#F9FAFB',      // Fundo claro
      bgWhite: '#FFFFFF',      // Branco
      border: '#E5E7EB'        // Bordas
    },
    
    // Estilos gerais anteriores mantidos
    loginContainer: {
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
    },
    loginBox: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '3rem',
      width: '100%',
      maxWidth: '28rem'
    },
    loginTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '2rem'
    },
    inputGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '2px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '2px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
      boxSizing: 'border-box'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },
    checkboxInput: {
      width: '1rem',
      height: '1rem',
      marginRight: '0.5rem'
    },
    loginButton: {
      width: '100%',
      backgroundColor: '#2563EB',
      color: 'white',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.2s'
    },
    forgotPassword: {
      textAlign: 'center',
      marginTop: '1.5rem'
    },
    link: {
      fontSize: '0.875rem',
      color: '#6b7280',
      textDecoration: 'none',
      cursor: 'pointer',
      background: 'none',
      border: 'none'
    },
    header: {
      backgroundColor: 'white',
      borderBottom: '2px solid #e5e7eb',
      padding: '1rem 2rem'
    },
    headerContent: {
      maxWidth: '80rem',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer'
    },
    logoImage: {
      height: '40px',
      width: 'auto'
    },
    nav: {
      display: 'flex',
      gap: '1rem'
    },
    navButton: {
      padding: '0.5rem 1rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.2s'
    },
    navButtonActive: {
      padding: '0.5rem 1rem',
      backgroundColor: '#DBEAFE',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      color: '#2563EB'
    },
    userIcon: {
      padding: '0.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '1.5rem',
      transition: 'background-color 0.2s'
    },
    catalogContainer: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
    },
    catalogMain: {
      maxWidth: '80rem',
      margin: '0 auto',
      padding: '2rem'
    },
    catalogTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '2rem'
    },
    searchContainer: {
      marginBottom: '2rem',
      maxWidth: '48rem',
      margin: '0 auto 2rem'
    },
    searchInputWrapper: {
      position: 'relative'
    },
    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      fontSize: '1.25rem'
    },
    searchInput: {
      width: '100%',
      paddingLeft: '3rem',
      paddingRight: '1rem',
      paddingTop: '0.75rem',
      paddingBottom: '0.75rem',
      border: '2px solid #d1d5db',
      borderRadius: '9999px',
      fontSize: '1rem',
      outline: 'none',
      boxSizing: 'border-box'
    },
    booksList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    bookCard: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      display: 'flex',
      gap: '1.5rem',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s'
    },
    bookCover: {
      width: '8rem',
      height: '12rem',
      backgroundColor: '#e5e7eb',
      borderRadius: '0.25rem',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      color: '#9ca3af'
    },
    bookInfo: {
      flex: 1
    },
    bookTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    bookDetail: {
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginTop: '0.75rem'
    },
    badgeAvailable: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    badgeUnavailable: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    detailsContainer: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
    },
    detailsMain: {
      maxWidth: '70rem',
      margin: '0 auto',
      padding: '2rem'
    },
    detailsBox: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '2rem'
    },
    detailsTop: {
      display: 'flex',
      gap: '2rem',
      marginBottom: '2rem'
    },
    detailsCover: {
      width: '16rem',
      height: '24rem',
      backgroundColor: '#e5e7eb',
      borderRadius: '0.25rem',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '5rem',
      color: '#9ca3af'
    },
    description: {
      flex: 1,
      color: '#6b7280',
      lineHeight: 1.7,
      fontSize: '1rem'
    },
    infoFields: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '2rem'
    },
    infoField: {
      display: 'flex',
      flexDirection: 'column'
    },
    fieldLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    fieldValue: {
      width: '100%',
      padding: '0.75rem 1rem',
      backgroundColor: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end'
    },
    backButton: {
      padding: '0.75rem 1.5rem',
      border: '2px solid #d1d5db',
      backgroundColor: 'white',
      borderRadius: '9999px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.2s'
    },
    reserveButton: {
      padding: '0.75rem 2rem',
      backgroundColor: '#2563EB',
      color: 'white',
      border: 'none',
      borderRadius: '9999px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.2s'
    },
    cancelButton: {
      padding: '0.5rem 1.5rem',
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '0.375rem',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'background-color 0.2s'
    },
    disabledButton: {
      padding: '0.75rem 2rem',
      backgroundColor: '#d1d5db',
      color: '#6b7280',
      border: 'none',
      borderRadius: '9999px',
      fontWeight: '600',
      cursor: 'not-allowed',
      fontSize: '1rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#6b7280',
      fontSize: '1.125rem'
    },
    // Novos estilos para Início
    heroSection: {
      textAlign: 'center',
      padding: '3rem 2rem',
      maxWidth: '800px',
      margin: '0 auto'
    },
    heroTitle: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      lineHeight: 1.2
    },
    heroDescription: {
      fontSize: '1.125rem',
      color: '#6b7280',
      marginBottom: '2rem',
      lineHeight: 1.6
    },
    heroButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center'
    },
    primaryButton: {
      padding: '0.875rem 2rem',
      backgroundColor: '#2563EB',
      color: 'white',
      border: 'none',
      borderRadius: '9999px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.2s'
    },
    secondaryButton: {
      padding: '0.875rem 2rem',
      backgroundColor: 'white',
      color: '#2563EB',
      border: '2px solid #2563EB',
      borderRadius: '9999px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.2s'
    },
    // Estilos para Sobre Nós
    aboutSection: {
      display: 'flex',
      gap: '3rem',
      alignItems: 'flex-start',
      marginBottom: '3rem'
    },
    aboutImage: {
      width: '400px',
      height: '300px',
      backgroundColor: '#e5e7eb',
      borderRadius: '0.5rem',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '4rem',
      color: '#9ca3af'
    },
    aboutContent: {
      flex: 1
    },
    sectionTitle: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    sectionText: {
      fontSize: '1rem',
      color: '#6b7280',
      lineHeight: 1.7,
      marginBottom: '1rem'
    },
    mapSection: {
      marginTop: '3rem',
      textAlign: 'center'
    },
    mapPlaceholder: {
      width: '100%',
      maxWidth: '800px',
      height: '400px',
      backgroundColor: '#e5e7eb',
      borderRadius: '0.5rem',
      margin: '2rem auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      color: '#9ca3af'
    },
    // Estilos para Perfil
    profileHeader: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    profileIcon: {
      fontSize: '5rem',
      marginBottom: '1rem'
    },
    profileName: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    profileEmail: {
      color: '#6b7280',
      marginBottom: '1.5rem'
    },
    profileActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '300px',
      margin: '0 auto 2rem'
    },
    profileButton: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: 'white',
      border: '2px solid #d1d5db',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.2s'
    },
    logoutButton: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: 'white',
      border: '2px solid #d1d5db',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.2s',
      color: '#dc2626'
    },
    historySection: {
      marginTop: '2rem'
    },
    historyTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    reservaCard: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      marginBottom: '1rem',
      display: 'flex',
      gap: '1.5rem'
    },
    reservaInfo: {
      flex: 1
    },
    smallCover: {
      width: '100px',
      height: '150px',
      backgroundColor: '#e5e7eb',
      borderRadius: '0.25rem',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      color: '#9ca3af'
    }
  };

  const handleLogin = () => {
    if (email && password) {
      setCurrentPage('inicio');
    }
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setCurrentPage('detalhes');
  };

  const handleReservar = () => {
    alert('Reserva efetuada com sucesso! Receberá um email de confirmação.');
    setCurrentPage('catalogo');
  };

  const handleCancelarReserva = (id) => {
    alert(`Reserva #${id} cancelada com sucesso!`);
  };

  const LoginPage = () => (
    <main style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <h1 style={styles.loginTitle}>LOGIN</h1>
        
        <div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <div style={styles.checkbox}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={styles.checkboxInput}
            />
            <label htmlFor="remember" style={{ fontSize: '0.875rem' }}>Lembrar conta</label>
          </div>

          <button onClick={handleLogin} style={styles.loginButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}>
            Log In
          </button>

          <div style={styles.forgotPassword}>
            <button style={styles.link}>
              Esqueceu-se da palavra passe?
            </button>
          </div>
        </div>
      </div>
    </main>
  );

  const Header = ({ activePage }) => (
    <header style={styles.header} role="banner">
      <div style={styles.headerContent}>
        <div style={styles.headerLeft}>
          <div style={styles.logo} onClick={() => setCurrentPage('inicio')}>
            <img 
              src="/logo-booktrack.png" 
              alt="BookTrack Logo" 
              style={styles.logoImage}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{ 
              display: 'none', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2563EB'
            }}>
              <span style={{ fontSize: '1.75rem' }}>📚</span>
              <span>BookTrack</span>
            </div>
          </div>
          <nav style={styles.nav} role="navigation" aria-label="Menu principal">
            <button 
              onClick={() => setCurrentPage('inicio')} 
              style={activePage === 'inicio' ? styles.navButtonActive : styles.navButton}
            >
              Início
            </button>
            <button 
              onClick={() => setCurrentPage('catalogo')} 
              style={activePage === 'catalogo' ? styles.navButtonActive : styles.navButton}
            >
              Catálogo
            </button>
            <button 
              onClick={() => setCurrentPage('sobre')} 
              style={activePage === 'sobre' ? styles.navButtonActive : styles.navButton}
            >
              Sobre nós
            </button>
          </nav>
        </div>
        <button onClick={() => setCurrentPage('perfil')} style={styles.userIcon}>
          👤
        </button>
      </div>
    </header>
  );

  const InicioPage = () => (
    <div style={styles.catalogContainer}>
      <Header activePage="inicio" />
      
      <main style={styles.catalogMain} role="main">
        <div style={styles.heroSection}>
          <h1 style={styles.heroTitle}>BEM VINDO À LIVRARIA</h1>
          <div style={styles.heroDescription}>
            <textarea 
              style={styles.textarea}
              placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Descubra nossa coleção de livros e reserve os seus favoritos de forma simples e rápida."
              readOnly
              value="Explore o nosso vasto catálogo de livros, faça reservas online e acompanhe o seu histórico de leituras. O BookTrack torna a gestão da biblioteca escolar mais fácil e acessível para todos."
            />
          </div>
          <div style={styles.heroButtons}>
            <button 
              onClick={() => setCurrentPage('catalogo')} 
              style={styles.primaryButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            >
              Pesquisar
            </button>
            <button 
              onClick={() => setCurrentPage('perfil')} 
              style={styles.secondaryButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#2563EB';
              }}
            >
              Reservar
            </button>
          </div>
        </div>
      </main>
    </div>
  );

  const SobrePage = () => (
    <div style={styles.catalogContainer}>
      <Header activePage="sobre" />
      
      <main style={styles.catalogMain} role="main">
        <h1 style={styles.catalogTitle}>SOBRE NÓS</h1>
        
        <div style={styles.detailsBox}>
          <div style={styles.aboutSection}>
            <div style={styles.aboutImage}>🏫</div>
            <div style={styles.aboutContent}>
              <textarea 
                style={styles.textarea}
                placeholder="Lorem ipsum..."
                value="O BookTrack é um sistema de gestão de biblioteca escolar desenvolvido para tornar o acesso aos livros mais fácil e eficiente. Nossa missão é promover a leitura e facilitar o processo de empréstimo de livros para toda a comunidade escolar."
                readOnly
              />
            </div>
          </div>

          <div style={styles.mapSection}>
            <h2 style={styles.sectionTitle}>Onde estamos localizados</h2>
            <div style={styles.mapPlaceholder}>🗺️</div>
          </div>
        </div>
      </main>
    </div>
  );

  const PerfilPage = () => (
    <div style={styles.catalogContainer}>
      <Header activePage="perfil" />
      
      <main style={styles.catalogMain} role="main">
        <h1 style={styles.catalogTitle}>PERFIL</h1>
        
        <div style={styles.detailsBox}>
          <div style={styles.profileHeader}>
            <div style={styles.profileIcon}>👤</div>
            <h2 style={styles.profileName}>{userData.nome}</h2>
            <p style={styles.profileEmail}>{userData.email}</p>
          </div>

          <div style={styles.profileActions}>
            <button 
              style={styles.profileButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Editar perfil
            </button>
            <button 
              style={styles.profileButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Alterar password
            </button>
            <button 
              onClick={() => setCurrentPage('reservas')} 
              style={styles.profileButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Consultar reservas
            </button>
            <button 
              onClick={() => setCurrentPage('login')} 
              style={styles.logoutButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#dc2626';
              }}
            >
              Log out
            </button>
          </div>

          <div style={styles.historySection}>
            <h3 style={styles.historyTitle}>Histórico</h3>
            {historicoEmprestimos.map((emp) => (
              <div key={emp.id} style={styles.reservaCard}>
                <div style={styles.smallCover}>📚</div>
                <div style={styles.reservaInfo}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {emp.livro}
                  </h4>
                  <p style={styles.bookDetail}>Autor: {emp.autor}</p>
                  <p style={styles.bookDetail}>Empréstimo: {emp.dataEmprestimo}</p>
                  <p style={styles.bookDetail}>Devolução: {emp.dataDevolucao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );

  const ReservasPage = () => (
    <div style={styles.catalogContainer}>
      <Header activePage="perfil" />
      
      <main style={styles.catalogMain} role="main">
        <h1 style={styles.catalogTitle}>RESERVAS</h1>
        
        <div style={styles.detailsBox}>
          {reservasAtivas.map((reserva) => (
            <div key={reserva.id} style={styles.reservaCard}>
              <div style={styles.smallCover}>📚</div>
              <div style={styles.reservaInfo}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {reserva.livro}
                </h4>
                <p style={styles.bookDetail}>Autor: {reserva.autor}</p>
                <p style={styles.bookDetail}>Data de Reserva: {reserva.dataReserva}</p>
                <p style={styles.bookDetail}>Data de Expiração: {reserva.dataExpiracao}</p>
              </div>
              <button 
                onClick={() => handleCancelarReserva(reserva.id)}
                style={styles.cancelButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                Cancelar
              </button>
            </div>
          ))}
          
          {reservasAtivas.length === 0 && (
            <div style={styles.emptyState}>
              <p>Não tem reservas ativas.</p>
            </div>
          )}
          
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              onClick={() => setCurrentPage('perfil')}
              style={styles.backButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Voltar ao Perfil
            </button>
          </div>
        </div>
      </main>
    </div>
  );

  const CatalogoPage = () => {
    const filteredBooks = books.filter(book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div style={styles.catalogContainer}>
        <Header activePage="catalogo" />
        
        <main style={styles.catalogMain} role="main">
          <h1 style={styles.catalogTitle}>CATÁLOGO</h1>
          
          <div style={styles.searchContainer}>
            <div style={styles.searchInputWrapper}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por título ou autor..."
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.booksList}>
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book)}
                style={styles.bookCard}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
              >
                <div style={styles.bookCover}>📚</div>
                
                <div style={styles.bookInfo}>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <p style={styles.bookDetail}>Autor: {book.author}</p>
                  <p style={styles.bookDetail}>Publicação: {book.publicacao}</p>
                  <p style={styles.bookDetail}>Categoria: {book.categoria}</p>
                  <div>
                    {book.disponivel ? (
                      <span style={{...styles.badge, ...styles.badgeAvailable}}>
                        Disponível
                      </span>
                    ) : (
                      <span style={{...styles.badge, ...styles.badgeUnavailable}}>
                        Indisponível
                      </span>
                    )}
                  </div>
                </div>
                
                <span style={{ fontSize: '1.5rem', color: '#9ca3af' }}>›</span>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div style={styles.emptyState}>
              <p>Nenhum livro encontrado.</p>
            </div>
          )}
        </main>
      </div>
    );
  };

  const DetalhesPage = () => {
    if (!selectedBook) return null;

    return (
      <div style={styles.detailsContainer}>
        <Header activePage="catalogo" />
        
        <main style={styles.detailsMain} role="main">
          <h1 style={styles.catalogTitle}>DETALHES DO LIVRO</h1>
          
          <div style={styles.detailsBox}>
            <div style={styles.detailsTop}>
              <div style={styles.detailsCover}>📚</div>
              
              <div style={styles.description}>
                <p>{selectedBook.descricao}</p>
              </div>
            </div>

            <div style={styles.infoFields}>
              <div style={styles.infoField}>
                <label style={styles.fieldLabel}>Título</label>
                <div style={styles.fieldValue}>{selectedBook.title}</div>
              </div>

              <div style={styles.infoField}>
                <label style={styles.fieldLabel}>Autor</label>
                <div style={styles.fieldValue}>{selectedBook.author}</div>
              </div>

              <div style={styles.infoField}>
                <label style={styles.fieldLabel}>Publicação</label>
                <div style={styles.fieldValue}>{selectedBook.publicacao}</div>
              </div>

              <div style={styles.infoField}>
                <label style={styles.fieldLabel}>Categoria</label>
                <div style={styles.fieldValue}>{selectedBook.categoria}</div>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                onClick={() => setCurrentPage('catalogo')}
                style={styles.backButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Voltar
              </button>
              {selectedBook.disponivel ? (
                <button
                  onClick={handleReservar}
                  style={styles.reserveButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                >
                  Reservar
                </button>
              ) : (
                <button disabled style={styles.disabledButton}>
                  Indisponível
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  };

  return (
    <div>
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'inicio' && <InicioPage />}
      {currentPage === 'catalogo' && <CatalogoPage />}
      {currentPage === 'detalhes' && <DetalhesPage />}
      {currentPage === 'sobre' && <SobrePage />}
      {currentPage === 'perfil' && <PerfilPage />}
      {currentPage === 'reservas' && <ReservasPage />}
    </div>
  );
};

export default BookTrackPrototype;