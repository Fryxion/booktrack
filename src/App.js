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

const AppContent = () => {
  const { isAuthenticated, logout, isBibliotecario } = useAuth();
  const [currentPage, setCurrentPageState] = useState(() => {
    // Carregar página do localStorage ou usar 'login' como padrão
    const savedPage = localStorage.getItem('currentPage');
    return savedPage || 'login';
  });
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Estados de feedback
  const [toast, setToast] = useState({ message: '', type: '' });
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  
  // Wrapper para setCurrentPage que também guarda no localStorage
  const setCurrentPage = (page) => {
    setCurrentPageState(page);
    localStorage.setItem('currentPage', page);
  };
  
  // Adicionar font do Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Redirecionar para início após login
  useEffect(() => {
    if (isAuthenticated && (currentPage === 'login' || currentPage === 'registar')) {
      setCurrentPage('inicio');
    }
  }, [isAuthenticated, currentPage]);

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!isAuthenticated && currentPage !== 'login' && currentPage !== 'registar') {
      setCurrentPage('login');
    }
  }, [isAuthenticated, currentPage]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setCurrentPage('detalhes');
  };

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setLogoutModalOpen(false);
    logout();
    localStorage.removeItem('currentPage'); // Limpar página guardada
    showToast('Sessão terminada com sucesso!', 'success');
    setTimeout(() => {
      setCurrentPage('login');
    }, 500);
  };

  const handleForgotPassword = () => {
    setForgotPasswordModalOpen(true);
  };

  const handleEditProfile = () => {
    setCurrentPage('editarperfil');
  };

  const handleChangePassword = () => {
    setChangePasswordModalOpen(true);
  };

  const handleLoginSuccess = (data) => {
    showToast(`Bem-vindo, ${data.user.nome}!`, 'success');
    setTimeout(() => {
      setCurrentPage('inicio');
    }, 500);
  };

  const handleRegisterSuccess = (data) => {
    showToast('Conta criada com sucesso! Faça login para continuar.', 'success');
    setTimeout(() => {
      setCurrentPage('login');
    }, 1500);
  };

  const handleGoToRegister = () => {
    setCurrentPage('registar');
  };

  const handleBackToLogin = () => {
    setCurrentPage('login');
  };

  return (
    <div>
      <Toast 
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      
      {/* Modal de logout */}
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

      {/* Modal de esqueceu-se da password */}
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

      {/* Modal de alterar password */}
      <ChangePasswordModal 
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        showToast={showToast}
      />
      
      {/* Páginas */}
      {!isAuthenticated ? (
        currentPage === 'registar' ? (
          <RegistarPage 
            onRegisterSuccess={handleRegisterSuccess}
            onBackToLogin={handleBackToLogin}
          />
        ) : (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onRegister={handleGoToRegister}
          />
        )
      ) : (
        <>
          {currentPage === 'inicio' && (
            <InicioPage setCurrentPage={setCurrentPage} />
          )}
          {currentPage === 'catalogo' && (
            <CatalogoPage 
              handleBookClick={handleBookClick}
              setCurrentPage={setCurrentPage}
            />
          )}
          {currentPage === 'detalhes' && (
            <DetalhesPage 
              selectedBook={selectedBook}
              setCurrentPage={setCurrentPage}
              showToast={showToast}
            />
          )}
          {currentPage === 'sobre' && (
            <SobrePage setCurrentPage={setCurrentPage} />
          )}
          {currentPage === 'perfil' && (
            <PerfilPage 
              setCurrentPage={setCurrentPage}
              onEditProfile={handleEditProfile}
              onChangePassword={handleChangePassword}
              onLogout={handleLogout}
            />
          )}
          {currentPage === 'editarperfil' && (
            <EditarPerfilPage 
              setCurrentPage={setCurrentPage}
              showToast={showToast}
              onLogout={logout}
            />
          )}
          {currentPage === 'reservas' && (
            <ReservasPage 
              setCurrentPage={setCurrentPage}
              showToast={showToast}
            />
          )}
          {isBibliotecario && currentPage === 'admin' && (
            <AdminPage setCurrentPage={setCurrentPage} />
          )}
        </>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
