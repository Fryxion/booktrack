// ==========================================
// CONTEXTO DE AUTENTICAÇÃO - BOOKTRACK
// ==========================================
// Este ficheiro cria um Context do React para gerir autenticação global
// 
// O QUÊ É UM CONTEXT:
// Context API permite partilhar dados entre componentes sem passar props
// manualmente por cada nível da árvore de componentes ("prop drilling")
//
// O QUE ESTE CONTEXT FAZ:
// - 🔐 Gere estado global de autenticação (user, token, isAuthenticated)
// - 💾 Persiste dados no localStorage (mantém sessão após refresh)
// - 🔄 Carrega utilizador automaticamente ao iniciar app
// - ✅ Valida token com servidor na inicialização
// - 🚪 Fornece funções: login, logout, register, updateUser
// - 👤 Helpers para verificar tipo de utilizador
//
// COMO USAR:
// 1. Envolver App com <AuthProvider>
// 2. Nos componentes: const { user, login, logout } = useAuth()
//
// FLUXO:
// App.js → AuthProvider envolve tudo → Qualquer componente pode usar useAuth()

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// ==========================================
// CRIAR CONTEXT
// ==========================================
// createContext() cria o objeto de contexto
// Será usado para fornecer e consumir valores
const AuthContext = createContext();

// ==========================================
// HOOK CUSTOMIZADO: useAuth
// ==========================================
// O QUÊ: Hook para aceder ao contexto de autenticação
// PORQUÊ: Simplifica uso do context + adiciona validação
// COMO USAR:
//   import { useAuth } from '../../contexts/AuthContext';
//   const { user, login, logout } = useAuth();
//
// PROTEÇÃO:
// Se usado fora do AuthProvider, lança erro explicativo
// Isto previne bugs de esquecer o Provider
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Validação: garante que está dentro do Provider
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// ==========================================
// COMPONENTE: AuthProvider
// ==========================================
// O QUÊ: Provider que envolve a aplicação e fornece contexto de auth
// PORQUÊ: Todos os componentes filhos podem aceder ao estado de autenticação
// COMO: <AuthProvider><App /></AuthProvider> em index.js ou App.js
export const AuthProvider = ({ children }) => {
  // ------------------------------------------
  // ESTADO GLOBAL DE AUTENTICAÇÃO
  // ------------------------------------------
  // user: Dados do utilizador autenticado
  // Estrutura: { id_utilizador, nome, email, tipo ('aluno'|'professor'|'bibliotecario') }
  // null = não autenticado
  const [user, setUser] = useState(null);
  
  // token: JWT token para autenticar requests à API
  // Guardado no localStorage e enviado no header Authorization
  // null = não autenticado
  const [token, setToken] = useState(null);
  
  // loading: Indica se está a carregar dados iniciais
  // true = verificando localStorage e validando token
  // false = inicialização completa, pode renderizar app
  const [loading, setLoading] = useState(true);
  
  // isAuthenticated: Booleano simples para verificar se está logado
  // Usado em App.js para decidir mostrar Login ou HomePage
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ==========================================
  // EFEITO: Carregar utilizador ao iniciar
  // ==========================================
  // O QUÊ: Executa uma vez quando a app inicia
  // PORQUÊ: Restaurar sessão se utilizador já estava logado
  // QUANDO: [] vazio = só executa no mount
  //
  // FLUXO:
  // 1. Verifica localStorage (token + user)
  // 2. Se existir: restaura no estado
  // 3. Valida token com servidor (authAPI.getMe())
  // 4. Se válido: atualiza dados do user
  // 5. Se inválido: faz logout (limpa tudo)
  // 6. Sempre desativa loading no final
  //
  // RESULTADO:
  // - Utilizador mantém sessão após refresh da página
  // - Tokens expirados são automaticamente removidos
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Buscar dados do localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        // Se ambos existirem, tentar restaurar sessão
        if (storedToken && storedUser) {
          // Restaurar no estado
          setToken(storedToken);
          setUser(JSON.parse(storedUser)); // Parse porque localStorage guarda strings
          setIsAuthenticated(true);

          // ------------------------------------------
          // VALIDAÇÃO DO TOKEN COM SERVIDOR
          // ------------------------------------------
          // Verifica se token ainda é válido
          // Importante: token pode ter expirado desde último uso
          try {
            const response = await authAPI.getMe();
            
            if (response.success) {
              // Token válido: atualiza dados (podem ter mudado no servidor)
              setUser(response.data);
              localStorage.setItem('user', JSON.stringify(response.data));
            }
          } catch (error) {
            // Token inválido ou expirado: faz logout
            // Isto limpa localStorage e reseta estado
            logout();
          }
        }
      } catch (error) {
        // Erro ao processar localStorage (dados corrompidos, etc)
        console.error('Erro ao carregar utilizador:', error);
        logout(); // Limpa tudo para estado limpo
      } finally {
        // SEMPRE desativa loading (sucesso ou erro)
        // Isto permite renderizar a app
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ==========================================
  // FUNÇÃO: login
  // ==========================================
  // O QUÊ: Autentica utilizador com email e password
  // PORQUÊ: Permitir acesso ao sistema
  // COMO:
  //   1. Chama API authAPI.login(email, password)
  //   2. Se sucesso: recebe { token, user }
  //   3. Guarda no localStorage (persistência)
  //   4. Atualiza estado global (user, token, isAuthenticated)
  //   5. Retorna { success: true }
  //   6. Se erro: retorna { success: false, message }
  //
  // PARÂMETROS:
  //   - email: Email do utilizador
  //   - password: Password em texto (API faz hash)
  //
  // RETORNA:
  //   { success: boolean, data?: object, message?: string }
  //
  // USADO EM: LoginPage
  const login = async (email, password) => {
    try {
      // Chama endpoint POST /api/auth/login
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        // Extrair token e user da resposta
        const { token, user } = response.data;
        
        // ------------------------------------------
        // PERSISTÊNCIA NO LOCALSTORAGE
        // ------------------------------------------
        // Guarda token e user para manter sessão
        // após refresh da página
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user)); // Stringify porque só aceita strings
        
        // ------------------------------------------
        // ATUALIZAR ESTADO GLOBAL
        // ------------------------------------------
        // Todos os componentes que usam useAuth() verão estas mudanças
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, data: response.data };
      }
      
      // API retornou erro (credenciais inválidas, etc)
      return { success: false, message: response.message || 'Credenciais inválidas' };
    } catch (error) {
      // Erro de rede ou servidor
      console.error('Erro no login:', error);
      const message = error.response?.data?.message || 'Email ou password incorretos';
      return { success: false, message };
    }
  };

  // ==========================================
  // FUNÇÃO: logout
  // ==========================================
  // O QUÊ: Termina sessão do utilizador
  // PORQUÊ: Segurança - permite sair da conta
  // COMO:
  //   1. Remove token e user do localStorage
  //   2. Reseta todo o estado para null/false
  //   3. App.js detecta isAuthenticated=false e mostra LoginPage
  //
  // NOTA: Não chama API - logout é apenas local
  // (tokens JWT não podem ser "invalidados" no servidor)
  //
  // USADO EM: Header (botão logout), PerfilPage
  const logout = () => {
    // Limpar localStorage (remove persistência)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Resetar estado (componentes reagem a estas mudanças)
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // ==========================================
  // FUNÇÃO: register
  // ==========================================
  // O QUÊ: Cria nova conta de utilizador
  // PORQUÊ: Permitir novos utilizadores acederem ao sistema
  // COMO:
  //   1. Chama API authAPI.register(userData)
  //   2. Se sucesso: retorna { success: true }
  //   3. Se erro: retorna { success: false, message }
  //
  // PARÂMETROS:
  //   userData: { nome, email, password, tipo }
  //   - tipo é geralmente 'aluno' por padrão
  //
  // RETORNA:
  //   { success: boolean, message: string }
  //
  // NOTA: NÃO faz login automático!
  // Utilizador tem que fazer login após registo
  //
  // USADO EM: RegistarPage
  const register = async (userData) => {
    try {
      // Chama endpoint POST /api/auth/register
      const response = await authAPI.register(userData);
      
      if (response.success) {
        return { success: true, message: response.message };
      }
      
      // API retornou erro (email já existe, etc)
      return { success: false, message: response.message };
    } catch (error) {
      // Erro de rede ou servidor
      console.error('Erro no registo:', error);
      const message = error.response?.data?.message || 'Erro ao registar utilizador';
      return { success: false, message };
    }
  };

  // ==========================================
  // FUNÇÃO: updateUser
  // ==========================================
  // O QUÊ: Atualiza dados do utilizador no contexto
  // PORQUÊ: Após editar perfil, sincronizar mudanças
  // COMO:
  //   1. Atualiza estado user
  //   2. Atualiza localStorage (persistência)
  //
  // USADO EM: EditarPerfilPage (após salvar alterações)
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // ==========================================
  // HELPERS: Verificar tipo de utilizador
  // ==========================================
  // O QUÊ: Funções auxiliares para verificar tipo
  // PORQUÊ: Facilita controlo de acesso em componentes
  // COMO USAR:
  //   const { isBibliotecario } = useAuth();
  //   if (isBibliotecario()) { /* mostrar painel admin */ }
  //
  // TIPOS POSSÍVEIS:
  // - 'bibliotecario': Acesso total (admin)
  // - 'professor': Pode emprestar livros
  // - 'aluno': Pode emprestar e reservar livros
  
  // Verifica se é bibliotecário (administrador)
  const isBibliotecario = () => {
    return user?.tipo === 'bibliotecario';
  };

  // Verifica se é professor
  const isProfessor = () => {
    return user?.tipo === 'professor';
  };

  // Verifica se é aluno
  const isAluno = () => {
    return user?.tipo === 'aluno';
  };

  // ==========================================
  // VALOR DO CONTEXTO
  // ==========================================
  // O QUÊ: Objeto com todos os valores/funções disponíveis
  // PORQUÊ: Define a API pública do contexto
  // COMO: Acedido via useAuth() em qualquer componente filho
  //
  // VALORES DISPONÍVEIS:
  // - user: Dados do utilizador (ou null)
  // - token: JWT token (ou null)
  // - loading: Boolean - ainda está a inicializar?
  // - isAuthenticated: Boolean - está logado?
  // - login(email, password): Função para autenticar
  // - logout(): Função para terminar sessão
  // - register(userData): Função para criar conta
  // - updateUser(userData): Função para atualizar dados
  // - isBibliotecario(): Helper para verificar tipo
  // - isProfessor(): Helper para verificar tipo
  // - isAluno(): Helper para verificar tipo
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

  // ==========================================
  // RENDERIZAÇÃO DO PROVIDER
  // ==========================================
  // O QUÊ: Componente Provider que envolve a app
  // NOTA: {!loading && children}
  //   Só renderiza filhos DEPOIS de verificar localStorage
  //   Evita flash de "não autenticado" enquanto valida token
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
