// ==========================================
// PÁGINA DE PERFIL - BOOKTRACK
// ==========================================
// Esta é a página de perfil do utilizador autenticado
// Apresenta:
// - 👤 Informações pessoais (nome, email, tipo)
// - ✏️ Botões de ação (editar perfil, alterar password, reservas, logout)
// - 📚 Histórico de empréstimos com detalhes completos
// - 💰 Informação de multas
// - 🏷️ Estados dos empréstimos (ativo, devolvido, atrasado)
//
// Carrega dados do histórico automaticamente ao montar o componente
// através da API emprestimosAPI.getHistorico()

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/App';
import { useAuth } from '../../contexts/AuthContext';
import { emprestimosAPI } from '../../services/api';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - PerfilPage
// ==========================================
const PerfilPage = ({ setCurrentPage, onEditProfile, onChangePassword, onLogout }) => {
  // ------------------------------------------
  // CONTEXTO E DADOS DO UTILIZADOR
  // ------------------------------------------
  // user: Dados do utilizador autenticado (nome, email, tipo)
  // Vem do AuthContext que guarda info após login
  const { user } = useAuth();

  // ------------------------------------------
  // ESTADO DO COMPONENTE
  // ------------------------------------------
  // historicoEmprestimos: Array com todos os empréstimos do utilizador
  // Cada empréstimo contém:
  //   - id_emprestimo, isbn_livro, titulo, autor
  //   - data_emprestimo, data_devolucao_prevista, data_devolucao_efetiva
  //   - multa (valor em euros)
  //   - estado ('ativo', 'devolvido', 'atrasado')
  const [historicoEmprestimos, setHistoricoEmprestimos] = useState([]);
  
  // loading: Indica se está a carregar os dados da API
  // true = mostra spinner, false = mostra dados ou erro
  const [loading, setLoading] = useState(true);
  
  // error: Mensagem de erro se falhar ao carregar histórico
  // null = sem erro, string = mensagem para mostrar ao utilizador
  const [error, setError] = useState(null);

  // ==========================================
  // EFEITO: Carregar histórico ao montar
  // ==========================================
  // O QUÊ: Carrega histórico quando a página é aberta
  // PORQUÊ: Utilizador precisa ver seus empréstimos imediatamente
  // QUANDO: Só executa uma vez ([] vazio = apenas no mount)
  useEffect(() => {
    loadHistorico();
  }, []);

  // ==========================================
  // FUNÇÃO: loadHistorico
  // ==========================================
  // O QUÊ: Busca histórico de empréstimos do utilizador
  // PORQUÊ: Mostrar todos os livros emprestados (ativos e passados)
  // COMO:
  //   1. Ativa loading (mostra spinner)
  //   2. Limpa erros anteriores
  //   3. Chama API emprestimosAPI.getHistorico()
  //   4. Se sucesso: guarda array de empréstimos no estado
  //   5. Se erro: guarda mensagem para mostrar ao utilizador
  //   6. Sempre desativa loading no final
  //
  // ENDPOINT: GET /api/emprestimos/historico
  // AUTENTICAÇÃO: Usa token do localStorage
  // RETORNA: Array de empréstimos com dados do livro e datas
  const loadHistorico = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Chama endpoint que retorna histórico do utilizador autenticado
      const response = await emprestimosAPI.getHistorico();
      
      if (response.success) {
        // Sucesso: guarda array de empréstimos
        setHistoricoEmprestimos(response.data);
      } else {
        // Erro da API: mostra mensagem
        setError(response.message || 'Erro ao carregar histórico');
      }
    } catch (err) {
      // Erro de rede: servidor offline ou sem conexão
      console.error('Erro ao carregar histórico:', err);
      setError('Erro ao conectar ao servidor');
    } finally {
      // Sempre desativa loading (sucesso ou erro)
      setLoading(false);
    }
  };

  // ==========================================
  // FUNÇÃO AUXILIAR: formatDate
  // ==========================================
  // O QUÊ: Converte string de data ISO para formato português
  // ENTRADA: "2024-12-10T10:30:00.000Z" (ISO 8601)
  // SAÍDA: "10/12/2024" (dd/mm/yyyy)
  // NOTA: Se dateString for null/undefined, retorna 'N/A'
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
  };

  // ==========================================
  // FUNÇÃO AUXILIAR: getTipoLabel
  // ==========================================
  // O QUÊ: Converte tipo de utilizador para texto legível
  // ENTRADA: 'aluno', 'professor', 'bibliotecario'
  // SAÍDA: 'Aluno', 'Professor', 'Bibliotecário(a)'
  // NOTA: Se for tipo desconhecido, retorna o valor original
  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'aluno': return 'Aluno';
      case 'professor': return 'Professor';
      case 'bibliotecario': return 'Bibliotecário(a)';
      default: return tipo;
    }
  };

  // ------------------------------------------
  // GUARD CLAUSE: Proteção se não houver utilizador
  // ------------------------------------------
  // Se user for null (não autenticado), não renderiza nada
  // Isto não deve acontecer porque App.js só mostra esta página se autenticado,
  // mas serve como proteção extra
  if (!user) {
    return null;
  }

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <div className="catalog-container">
      {/* Cabeçalho com navegação (destaca "perfil" no menu) */}
      <Header activePage="perfil" setCurrentPage={setCurrentPage} />
      
      <main className="catalog-main" role="main">
        {/* Título da página */}
        <h1 className="catalog-title">PERFIL</h1>
        
        {/* Caixa principal com todas as informações */}
        <div className="details-box">
          {/* ------------------------------------------
              CABEÇALHO DO PERFIL
              ------------------------------------------
              Mostra informações principais do utilizador:
              - Ícone de perfil (👤)
              - Nome completo
              - Email
              - Tipo (Aluno/Professor/Bibliotecário)
          */}
          <div className="profile-header">
            {/* Ícone de utilizador */}
            <div className="profile-icon">👤</div>
            
            {/* Nome do utilizador (vem do AuthContext) */}
            <h2 className="profile-name">{user.nome}</h2>
            
            {/* Email do utilizador */}
            <p className="profile-email">{user.email}</p>
            
            {/* Badge com tipo de utilizador formatado */}
            <span className="badge badge-available" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {getTipoLabel(user.tipo)}
            </span>
          </div>

          {/* ------------------------------------------
              AÇÕES DO PERFIL
              ------------------------------------------
              Botões para diferentes ações do utilizador:
              - Editar perfil (nome, email)
              - Alterar password (segurança)
              - Consultar reservas (livros reservados)
              - Log out (terminar sessão)
          */}
          <div className="profile-actions">
            {/* Botão para ir para página de edição de perfil */}
            <button className="profile-button" onClick={onEditProfile}>
              Editar perfil
            </button>
            
            {/* Botão para ir para página de alteração de password */}
            <button className="profile-button" onClick={onChangePassword}>
              Alterar password
            </button>
            
            {/* Botão para ir para página de reservas ativas */}
            <button 
              onClick={() => setCurrentPage('reservas')} 
              className="profile-button"
            >
              Consultar reservas
            </button>
            
            {/* Botão de logout (classe diferente para destaque visual) */}
            <button 
              onClick={onLogout}
              className="logout-button"
            >
              Log out
            </button>
          </div>

          {/* ------------------------------------------
              HISTÓRICO DE EMPRÉSTIMOS
              ------------------------------------------
              Lista completa de todos os empréstimos do utilizador
              Mostra diferentes estados:
              - Loading: spinner enquanto carrega
              - Erro: mensagem + botão para tentar novamente
              - Vazio: mensagem se não houver empréstimos
              - Lista: cards com detalhes de cada empréstimo
          */}
          <div className="history-section">
            {/* Título da secção */}
            <h3 className="history-title">Histórico de Empréstimos</h3>
            
            {/* ESTADO 1: Loading - A carregar dados */}
            {loading ? (
              <div className="empty-state">
                <div className="spinner"></div>
                <p>A carregar histórico...</p>
              </div>
            
            /* ESTADO 2: Erro - Falha ao carregar */
            ) : error ? (
              <div className="empty-state">
                {/* Mensagem de erro em vermelho */}
                <p style={{ color: '#ef4444' }}>{error}</p>
                {/* Botão para tentar carregar novamente */}
                <button className="secondary-button" onClick={loadHistorico}>
                  Tentar novamente
                </button>
              </div>
            
            /* ESTADO 3: Vazio - Sem empréstimos */
            ) : historicoEmprestimos.length === 0 ? (
              <div className="empty-state">
                <p>Ainda não tem empréstimos registados.</p>
              </div>
            
            /* ESTADO 4: Lista - Mostra todos os empréstimos */
            ) : (
              historicoEmprestimos.map((emp) => (
                <div key={emp.id_emprestimo} className="reserva-card">
                  {/* Ícone do livro */}
                  <div className="small-cover">📚</div>
                  
                  {/* Informações do empréstimo */}
                  <div className="reserva-info">
                    {/* Título do livro (com fallback se não existir) */}
                    <h4 className="reserva-title">
                      {emp.titulo || 'Título não disponível'}
                    </h4>
                    
                    {/* Autor do livro */}
                    <p className="book-detail">Autor: {emp.autor || 'N/A'}</p>
                    
                    {/* ISBN (código único do livro) */}
                    <p className="book-detail">ISBN: {emp.isbn_livro}</p>
                    
                    {/* Data em que foi feito o empréstimo */}
                    <p className="book-detail">Empréstimo: {formatDate(emp.data_emprestimo)}</p>
                    
                    {/* Data em que deveria ser devolvido */}
                    <p className="book-detail">
                      Devolução Prevista: {formatDate(emp.data_devolucao_prevista)}
                    </p>
                    
                    {/* Data real da devolução (se já foi devolvido) */}
                    <p className="book-detail">
                      Devolução Efetiva: {emp.data_devolucao_efetiva ? formatDate(emp.data_devolucao_efetiva) : '-'}
                    </p>
                    
                    {/* Valor da multa (€0.00 se devolveu a tempo) */}
                    <p className="book-detail">
                      Multa: {emp.multa}€
                    </p>
                    
                    {/* ------------------------------------------
                        BADGES DE ESTADO
                        ------------------------------------------
                        Mostra estado atual do empréstimo:
                        - Ativo (verde): Ainda não devolveu
                        - Devolvido (azul): Já devolveu
                        - Atrasado (vermelho): Passou da data prevista
                    */}
                    <div style={{ marginTop: '0.5rem' }}>
                      {/* Badge verde para empréstimos ativos */}
                      {emp.estado === 'ativo' && (
                        <span className="badge badge-available">Ativo</span>
                      )}
                      
                      {/* Badge azul para empréstimos devolvidos */}
                      {emp.estado === 'devolvido' && (
                        <span className="badge" style={{ 
                          backgroundColor: '#dbeafe', 
                          color: '#1e40af' 
                        }}>Devolvido</span>
                      )}
                      
                      {/* Badge vermelho para empréstimos atrasados */}
                      {emp.estado === 'atrasado' && (
                        <span className="badge badge-unavailable">Atrasado</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PerfilPage;
