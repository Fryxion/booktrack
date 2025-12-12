import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar utilizador do localStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Verificar se o token ainda é válido
          try {
            const response = await authAPI.getMe();
            if (response.success) {
              setUser(response.data);
              localStorage.setItem('user', JSON.stringify(response.data));
            }
          } catch (error) {
            // Token inválido ou expirado
            logout();
          }
        }
      } catch (error) {
        console.error('Erro ao carregar utilizador:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { token, user } = response.data;
        
        // Guardar no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Atualizar estado
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message || 'Credenciais inválidas' };
    } catch (error) {
      console.error('Erro no login:', error);
      const message = error.response?.data?.message || 'Email ou password incorretos';
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Registar
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Erro no registo:', error);
      const message = error.response?.data?.message || 'Erro ao registar utilizador';
      return { success: false, message };
    }
  };

  // Atualizar dados do utilizador
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Verificar se é bibliotecário
  const isBibliotecario = () => {
    return user?.tipo === 'bibliotecario';
  };

  // Verificar se é professor
  const isProfessor = () => {
    return user?.tipo === 'professor';
  };

  // Verificar se é aluno
  const isAluno = () => {
    return user?.tipo === 'aluno';
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    updateUser,
    isBibliotecario,
    isProfessor,
    isAluno,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
