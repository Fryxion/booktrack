import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/Login/App';
import RegistarPage from './pages/Registar/App';
import InicioPage from './pages/Inicio/App';
import SobrePage from './pages/Sobre/App';
import PerfilPage from './pages/Perfil/App';
import ReservasPage from './pages/Reservas/App';
import CatalogoPage from './pages/Catalogo/App';
import DetalhesPage from './pages/Detalhes/App';
import AdminPage from './pages/Admin/App';
import Toast from './components/Toast/App';
import Modal from './components/Modal/App';
import './styles/App.css';

const AppContent = () => {
  const { isAuthenticated, logout, isBibliotecario } = useAuth();
  const [currentPage, setCurrentPage] = useState('login');
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Estados de feedback
  const [toast, setToast] = useState({ message: '', type: '' });
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  
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
    showToast('Sessão terminada com sucesso!', 'success');
    setTimeout(() => {
      setCurrentPage('login');
    }, 500);
  };

  const handleForgotPassword = () => {
    setForgotPasswordModalOpen(true);
  };

  const handleEditProfile = () => {
    setEditProfileModalOpen(true);
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

      {/* Modal de editar perfil */}
      <Modal 
        isOpen={editProfileModalOpen}
        title="Editar Perfil"
        message="Funcionalidade de edição de perfil em desenvolvimento. Em breve poderá alterar os seus dados pessoais."
        onConfirm={() => {
          setEditProfileModalOpen(false);
          showToast('Funcionalidade em desenvolvimento', 'info');
        }}
        onCancel={() => setEditProfileModalOpen(false)}
        confirmText="OK"
        cancelText="Fechar"
        type="default"
      />

      {/* Modal de alterar password */}
      <Modal 
        isOpen={changePasswordModalOpen}
        title="Alterar Password"
        message="Para alterar a sua password, contacte o bibliotecário."
        onConfirm={() => {
          setChangePasswordModalOpen(false);
          showToast('Contacte o bibliotecário para alterar a password', 'info');
        }}
        onCancel={() => setChangePasswordModalOpen(false)}
        confirmText="OK"
        cancelText="Fechar"
        type="default"
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
