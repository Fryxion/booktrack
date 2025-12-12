import axios from 'axios';

// Criar instância do axios com configuração base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se token expirado ou inválido, fazer logout
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Registar novo utilizador
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Obter dados do utilizador atual
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Alterar password
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/update-password', {
      currentPassword: currentPassword,
      newPassword: newPassword,
    });
    return response.data;
  },

  // Atualizar perfil
  updateProfile: async (userData) => {
    const response = await api.put('/auth/update-profile', userData);
    return response.data;
  },

  // Eliminar conta
  deleteAccount: async () => {
    const response = await api.delete('/auth/delete-account');
    return response.data;
  },
};

// ==================== LIVROS ====================
export const livrosAPI = {
  // Listar todos os livros (com filtros opcionais)
  getAll: async (params = {}) => {
    const response = await api.get('/livros', { params });
    return response.data;
  },

  // Obter detalhes de um livro
  getById: async (id) => {
    const response = await api.get(`/livros/${id}`);
    return response.data;
  },

  // Criar novo livro (apenas bibliotecário)
  create: async (livroData) => {
    const response = await api.post('/livros', livroData);
    return response.data;
  },

  // Atualizar livro (apenas bibliotecário)
  update: async (id, livroData) => {
    const response = await api.put(`/livros/${id}`, livroData);
    return response.data;
  },

  // Eliminar livro (apenas bibliotecário)
  delete: async (id) => {
    const response = await api.delete(`/livros/${id}`);
    return response.data;
  },

  // Listar categorias
  getCategorias: async () => {
    const response = await api.get('/livros/categorias/list');
    return response.data;
  },
};

// ==================== RESERVAS ====================
export const reservasAPI = {
  // Listar todas as reservas (bibliotecário vê todas, utilizador vê só as suas)
  getAll: async () => {
    const response = await api.get('/reservas');
    return response.data;
  },

  // Obter reservas ativas do utilizador
  getMinhas: async () => {
    const response = await api.get(`/reservas`);
    return response.data;
  },

  // Criar nova reserva
  create: async (id_livro) => {
    const response = await api.post('/reservas', { id_livro });
    return response.data;
  },

  // Cancelar reserva
  cancelar: async (id) => {
    const response = await api.put(`/reservas/${id}/cancelar`);
    return response.data;
  },

  // Confirmar reserva (apenas bibliotecário)
  confirmar: async (id) => {
    const response = await api.put(`/reservas/${id}/confirmar`);
    return response.data;
  },
};

// ==================== EMPRÉSTIMOS ====================
export const emprestimosAPI = {
  // Listar empréstimos (bibliotecário vê todos, utilizador vê só os seus)
  getAll: async () => {
    const response = await api.get('/emprestimos');
    return response.data;
  },

  // Obter empréstimos ativos do utilizador
  getAtivos: async () => {
    const response = await api.get('/emprestimos/ativos');
    return response.data;
  },

  // Obter histórico de empréstimos do utilizador
  getHistorico: async () => {
    const response = await api.get('/emprestimos');
    return response.data;
  },

  // Criar novo empréstimo (apenas bibliotecário)
  create: async (emprestimoData) => {
    const response = await api.post('/emprestimos', emprestimoData);
    return response.data;
  },

  // Registar devolução (apenas bibliotecário)
  devolver: async (id) => {
    const response = await api.put(`/emprestimos/${id}/devolver`);
    return response.data;
  },

  // Renovar empréstimo
  renovar: async (id) => {
    const response = await api.put(`/emprestimos/${id}/renovar`);
    return response.data;
  },
};

export default api;
