// ==========================================
// FICHEIRO PRINCIPAL DA APLICAÇÃO BOOKTRACK
// ==========================================
// Este ficheiro é o "cérebro" da aplicação - controla todas as páginas,
// a navegação entre elas, e os estados globais (como login, logout, mensagens)

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/Login/App';
import RegistarPage from './pages/Registar/App';
import InicioPage from './pages/Inicio/App';
import SobrePage from './pages/Sobre/App';
import PerfilPage from './pages/Perfil/App';
import EditarPerfilPage from './pages/EditarPerfil/App';
import ReservasPage from './pages/Reservas/App';
import CatalogoPage from './pages/Catalogo/App';
import DetalhesPage from './pages/Detalhes/App';
import AdminPage from './pages/Admin/App';
import Toast from './components/Toast/App';
import Modal from './components/Modal/App';
import ChangePasswordModal from './components/ChangePasswordModal/App';
import './styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - AppContent
// ==========================================
// Este componente gere toda a lógica da aplicação:
// - Que página mostrar ao utilizador
// - Se o utilizador está autenticado (fez login)
// - Mostrar mensagens de sucesso/erro (toasts)
// - Mostrar janelas de confirmação (modais)
const AppContent = () => {
  // ------------------------------------------
  // CONTEXTO DE AUTENTICAÇÃO
  // ------------------------------------------
  // useAuth() dá-nos acesso a informações sobre o utilizador:
  // - isAuthenticated: true se o utilizador fez login, false se não
  // - logout: função para terminar a sessão
  // - isBibliotecario: true se o utilizador é bibliotecário (admin)
  const { isAuthenticated, logout, isBibliotecario } = useAuth();
  
  // ------------------------------------------
  // ESTADO: PÁGINA ATUAL
  // ------------------------------------------
  // Controla qual página está a ser mostrada ao utilizador
  // Exemplos: 'login', 'catalogo', 'perfil', 'admin', etc.
  // 
  // useState(() => {...}) executa apenas 1 vez quando a app inicia
  // e tenta carregar a última página visitada do navegador (localStorage)
  const [currentPage, setCurrentPageState] = useState(() => {
    // Carregar página do localStorage ou usar 'login' como padrão
    // localStorage = memória do navegador que persiste mesmo fechando a aba
    const savedPage = localStorage.getItem('currentPage');
    return savedPage || 'login'; // Se não houver página guardada, usa 'login'
  });
  
  // ------------------------------------------
  // ESTADO: LIVRO SELECIONADO
  // ------------------------------------------
  // Quando o utilizador clica num livro no catálogo,
  // guardamos esse livro aqui para depois mostrar os seus detalhes
  const [selectedBook, setSelectedBook] = useState(null);
  
  // ------------------------------------------
  // ESTADOS DE FEEDBACK (Mensagens e Janelas)
  // ------------------------------------------
  
  // Toast: Pequena mensagem que aparece no canto superior direito do ecrã
  // Exemplo: "Login efetuado com sucesso!" (verde) ou "Erro ao reservar" (vermelho)
  // { message: 'texto da mensagem', type: 'success' | 'error' | 'info' }
  const [toast, setToast] = useState({ message: '', type: '' });
  
  // Modal de Logout: Janela que pergunta "Tem a certeza que quer sair?"
  // true = mostrar janela, false = esconder janela
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  
  // Modal de Recuperar Password: Janela com instruções para recuperar password
  // true = mostrar janela, false = esconder janela
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  
  // Modal de Alterar Password: Janela onde o utilizador pode trocar a password
  // true = mostrar janela, false = esconder janela
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  
  // ------------------------------------------
  // FUNÇÃO: MUDAR DE PÁGINA (COM GRAVAÇÃO)
  // ------------------------------------------
  // Esta função faz duas coisas importantes:
  // 1. Muda a página atual na aplicação
  // 2. Guarda a página no navegador (localStorage) para lembrar depois
  //    (mesmo se o utilizador fechar e abrir o navegador novamente)
  const setCurrentPage = (page) => {
    setCurrentPageState(page); // Atualiza o estado da página
    localStorage.setItem('currentPage', page); // Guarda no navegador
  };
  
  // ------------------------------------------
  // EFEITO: CARREGAR FONTE DO GOOGLE
  // ------------------------------------------
  // useEffect executa código quando o componente aparece pela primeira vez
  // Aqui estamos a adicionar a fonte "Inter" do Google Fonts ao HTML
  // para ter letras mais bonitas na aplicação
  useEffect(() => {
    const link = document.createElement('link'); // Criar elemento <link>
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link); // Adicionar ao <head> da página
  }, []); // [] significa: executar apenas 1 vez quando o componente carregar

  // ------------------------------------------
  // EFEITO: REDIRECIONAR APÓS LOGIN
  // ------------------------------------------
  // Se o utilizador acabou de fazer login (isAuthenticated = true)
  // e ainda está na página de login ou registo,
  // redireciona automaticamente para a página inicial
  useEffect(() => {
    if (isAuthenticated && (currentPage === 'login' || currentPage === 'registar')) {
      setCurrentPage('inicio'); // Ir para página inicial
    }
  }, [isAuthenticated, currentPage]); // Executa sempre que isAuthenticated ou currentPage mudar

  // ------------------------------------------
  // EFEITO: PROTEGER PÁGINAS (SEGURANÇA)
  // ------------------------------------------
  // Se o utilizador NÃO está autenticado (não fez login)
  // e tenta aceder a uma página privada (que não seja login ou registo),
  // redireciona automaticamente para o login
  // Isto impede que pessoas não autenticadas vejam conteúdo privado
  useEffect(() => {
    if (!isAuthenticated && currentPage !== 'login' && currentPage !== 'registar') {
      setCurrentPage('login'); // Volta para o login
    }
  }, [isAuthenticated, currentPage]); // Executa quando isAuthenticated ou currentPage mudar

  // ------------------------------------------
  // FUNÇÃO: MOSTRAR MENSAGEM (TOAST)
  // ------------------------------------------
  // Mostra uma pequena mensagem no canto superior direito do ecrã
  // Exemplos de uso:
  // - showToast('Sucesso!', 'success') → mensagem verde de sucesso
  // - showToast('Erro!', 'error') → mensagem vermelha de erro
  // - showToast('Informação', 'info') → mensagem azul de informação
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // ------------------------------------------
  // FUNÇÃO: CLICAR NUM LIVRO
  // ------------------------------------------
  // Quando o utilizador clica num livro no catálogo:
  // 1. Guarda o livro selecionado no estado
  // 2. Vai para a página de detalhes desse livro
  const handleBookClick = (book) => {
    setSelectedBook(book); // Guardar o livro clicado
    setCurrentPage('detalhes'); // Ir para página de detalhes
  };

  // ------------------------------------------
  // FUNÇÃO: INICIAR LOGOUT
  // ------------------------------------------
  // Quando o utilizador clica no botão "Log Out":
  // Abre uma janela (modal) a perguntar se tem a certeza que quer sair
  // (não faz logout imediatamente, espera confirmação)
  const handleLogout = () => {
    setLogoutModalOpen(true); // Abrir janela de confirmação
  };

  // ------------------------------------------
  // FUNÇÃO: CONFIRMAR LOGOUT
  // ------------------------------------------
  // Quando o utilizador confirma que quer mesmo sair:
  // 1. Fecha a janela de confirmação
  // 2. Executa a função logout() para terminar a sessão no servidor
  // 3. Remove a página guardada da memória do navegador
  // 4. Mostra mensagem verde de sucesso
  // 5. Redireciona para o login após meio segundo
  const confirmLogout = () => {
    setLogoutModalOpen(false); // Fechar janela
    logout(); // Terminar sessão
    localStorage.removeItem('currentPage'); // Limpar página guardada
    showToast('Sessão terminada com sucesso!', 'success'); // Mensagem verde
    setTimeout(() => {
      setCurrentPage('login'); // Ir para login após 500ms (0.5 segundos)
    }, 500);
  };

  // ------------------------------------------
  // FUNÇÃO: ESQUECEU PASSWORD
  // ------------------------------------------
  // Abre uma janela (modal) com instruções para recuperar a password
  const handleForgotPassword = () => {
    setForgotPasswordModalOpen(true); // Abrir janela
  };

  // ------------------------------------------
  // FUNÇÃO: EDITAR PERFIL
  // ------------------------------------------
  // Leva o utilizador para a página onde pode editar os seus dados pessoais
  const handleEditProfile = () => {
    setCurrentPage('editarperfil'); // Ir para página de editar perfil
  };

  // ------------------------------------------
  // FUNÇÃO: ALTERAR PASSWORD
  // ------------------------------------------
  // Abre uma janela (modal) onde o utilizador pode trocar a sua password
  const handleChangePassword = () => {
    setChangePasswordModalOpen(true); // Abrir janela
  };

  // ------------------------------------------
  // FUNÇÃO: SUCESSO NO LOGIN
  // ------------------------------------------
  // Executada quando o utilizador faz login com sucesso
  // Recebe os dados do utilizador (data.user.nome)
  // Mostra mensagem de boas-vindas e redireciona para o início
  const handleLoginSuccess = (data) => {
    showToast(`Bem-vindo, ${data.user.nome}!`, 'success'); // Mensagem verde
    setTimeout(() => {
      setCurrentPage('inicio'); // Ir para início após 500ms (0.5 segundos)
    }, 500);
  };

  // ------------------------------------------
  // FUNÇÃO: SUCESSO NO REGISTO
  // ------------------------------------------
  // Executada quando o utilizador cria uma conta nova com sucesso
  // Mostra mensagem de sucesso e redireciona para o login
  // (o utilizador precisa fazer login com a nova conta)
  const handleRegisterSuccess = (data) => {
    showToast('Conta criada com sucesso! Faça login para continuar.', 'success'); // Mensagem verde
    setTimeout(() => {
      setCurrentPage('login'); // Ir para login após 1.5 segundos
    }, 1500);
  };

  // ------------------------------------------
  // FUNÇÃO: IR PARA PÁGINA DE REGISTO
  // ------------------------------------------
  // Leva o utilizador da página de login para a página de criar conta
  const handleGoToRegister = () => {
    setCurrentPage('registar'); // Ir para página de registo
  };

  // ------------------------------------------
  // FUNÇÃO: VOLTAR PARA LOGIN
  // ------------------------------------------
  // Leva o utilizador da página de registo de volta para o login
  const handleBackToLogin = () => {
    setCurrentPage('login'); // Voltar para login
  };

  // ==========================================
  // RENDERIZAÇÃO (O QUE APARECE NO ECRÃ)
  // ==========================================
  // Esta secção define o HTML que será mostrado ao utilizador
  return (
    <div>
      {/* ------------------------------------------
          COMPONENTE TOAST (Mensagens)
          ------------------------------------------
          Mostra pequenas mensagens no canto superior direito do ecrã
          Exemplos: "Login efetuado!" (verde), "Erro ao reservar" (vermelho)
          A mensagem desaparece automaticamente após alguns segundos
      */}
      <Toast 
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      
      {/* ------------------------------------------
          MODAL DE LOGOUT
          ------------------------------------------
          Janela que pergunta: "Tem a certeza que quer sair?"
          Só aparece quando logoutModalOpen = true
          
          Botões:
          - "Sim, sair" (vermelho) → executa confirmLogout()
          - "Cancelar" (cinzento) → fecha a janela
      */}
      <Modal 
        isOpen={logoutModalOpen}
        title="Terminar Sessão"
        message="Tem a certeza que deseja sair da sua conta?"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
        confirmText="Sim, sair"
        cancelText="Cancelar"
        type="danger"
      />

      {/* ------------------------------------------
          MODAL DE RECUPERAR PASSWORD
          ------------------------------------------
          Janela com instruções para recuperar a password
          Só aparece quando forgotPasswordModalOpen = true
          
          Diz ao utilizador para contactar o bibliotecário
          (não há sistema automático de recuperação)
      */}
      <Modal 
        isOpen={forgotPasswordModalOpen}
        title="Recuperar Password"
        message="Entre em contato com o bibliotecário para recuperar a sua password."
        onConfirm={() => {
          setForgotPasswordModalOpen(false);
          showToast('Contacte o bibliotecário para recuperar a password', 'info');
        }}
        onCancel={() => setForgotPasswordModalOpen(false)}
        confirmText="OK"
        cancelText="Cancelar"
        type="default"
      />

      {/* ------------------------------------------
          MODAL DE ALTERAR PASSWORD
          ------------------------------------------
          Janela onde o utilizador pode trocar a sua password
          Só aparece quando changePasswordModalOpen = true
          
          Tem campos para:
          - Password atual
          - Nova password
          - Confirmar nova password
      */}
      <ChangePasswordModal 
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        showToast={showToast}
      />
      
      {/* ==========================================
          LÓGICA DE PÁGINAS
          ==========================================
          Esta secção decide qual página mostrar ao utilizador
          
          Depende de duas coisas:
          1. Se o utilizador está autenticado (fez login)
          2. Qual é a página atual (currentPage)
          
          ESTRUTURA:
          - Se NÃO está autenticado → mostra Login ou Registo
          - Se ESTÁ autenticado → mostra páginas privadas (catálogo, perfil, etc.)
      */}
      
      {/* ------------------------------------------
          SE NÃO ESTÁ AUTENTICADO (não fez login)
          ------------------------------------------
          Mostra apenas as páginas públicas: Login ou Registo
          Todas as outras páginas estão bloqueadas
      */}
      {!isAuthenticated ? (
        currentPage === 'registar' ? (
          // Página de criar conta nova
          <RegistarPage 
            onRegisterSuccess={handleRegisterSuccess}
            onBackToLogin={handleBackToLogin}
          />
        ) : (
          // Página de login (padrão)
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onRegister={handleGoToRegister}
          />
        )
      ) : (
        // ------------------------------------------
        // SE ESTÁ AUTENTICADO (fez login)
        // ------------------------------------------
        // Mostra as páginas privadas de acordo com currentPage
        // Cada página só aparece quando currentPage tem o valor correspondente
        <>
          {/* Página Inicial - Página de boas-vindas */}
          {currentPage === 'inicio' && (
            <InicioPage setCurrentPage={setCurrentPage} />
          )}
          
          {/* Página do Catálogo - Lista de todos os livros disponíveis */}
          {currentPage === 'catalogo' && (
            <CatalogoPage 
              handleBookClick={handleBookClick}
              setCurrentPage={setCurrentPage}
            />
          )}
          
          {/* Página de Detalhes de um Livro - Informação completa sobre 1 livro */}
          {currentPage === 'detalhes' && (
            <DetalhesPage 
              selectedBook={selectedBook}
              setCurrentPage={setCurrentPage}
              showToast={showToast}
            />
          )}
          
          {/* Página Sobre Nós - Informações sobre a biblioteca */}
          {currentPage === 'sobre' && (
            <SobrePage setCurrentPage={setCurrentPage} />
          )}
          
          {/* Página de Perfil do Utilizador - Ver dados pessoais e histórico */}
          {currentPage === 'perfil' && (
            <PerfilPage 
              setCurrentPage={setCurrentPage}
              onEditProfile={handleEditProfile}
              onChangePassword={handleChangePassword}
              onLogout={handleLogout}
            />
          )}
          
          {/* Página de Editar Perfil - Alterar dados pessoais */}
          {currentPage === 'editarperfil' && (
            <EditarPerfilPage 
              setCurrentPage={setCurrentPage}
              showToast={showToast}
              onLogout={logout}
            />
          )}
          
          {/* Página de Minhas Reservas - Ver livros que o utilizador reservou */}
          {currentPage === 'reservas' && (
            <ReservasPage 
              setCurrentPage={setCurrentPage}
              showToast={showToast}
            />
          )}
          
          {/* ------------------------------------------
              PÁGINA DE ADMINISTRAÇÃO (APENAS BIBLIOTECÁRIOS)
              ------------------------------------------
              Esta página só aparece se AMBAS as condições forem verdadeiras:
              1. O utilizador é bibliotecário (isBibliotecario = true)
              2. A página atual é 'admin'
              
              Permite gerir livros, utilizadores, empréstimos e reservas
          */}
          {isBibliotecario && currentPage === 'admin' && (
            <AdminPage setCurrentPage={setCurrentPage} />
          )}
        </>
      )}
    </div>
  );
};

// ==========================================
// COMPONENTE WRAPPER - App
// ==========================================
// Este é o componente raiz (principal) da aplicação
// Envolve tudo com o AuthProvider, que fornece o contexto de autenticação
// 
// O AuthProvider permite que QUALQUER componente da aplicação aceda a:
// - isAuthenticated (se o utilizador está logado)
// - logout (função para terminar sessão)
// - isBibliotecario (se é admin)
// - etc.
// 
// Sem o AuthProvider, cada página teria de gerir a autenticação sozinha
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;