// ==========================================
// PÁGINA DE ADMINISTRAÇÃO - BOOKTRACK
// ==========================================
// Esta página é exclusiva para bibliotecários (admins) e permite gerir:
// - 📚 Livros: adicionar, editar, eliminar livros do catálogo
// - 👥 Utilizadores: ver lista de utilizadores e alterar os seus tipos (aluno/professor/bibliotecário)
// - 📖 Empréstimos: ver todos os empréstimos ativos e registar devoluções
// - 🔖 Reservas: ver reservas pendentes, processar (converter em empréstimo) ou cancelar
//
// APENAS BIBLIOTECÁRIOS TÊM ACESSO A ESTA PÁGINA!
// O acesso é controlado pelo App.js principal que verifica se isBibliotecario = true

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/App';
import '../../styles/App.css';
import '../../styles/Admin.css';
import api from '../../services/api';

// ==========================================
// COMPONENTE PRINCIPAL - AdminPage
// ==========================================
const AdminPage = ({ setCurrentPage }) => {
  // ------------------------------------------
  // ESTADO: CONTROLO DE TABS
  // ------------------------------------------
  // Define qual separador (tab) está ativo
  // Valores possíveis: 'livros', 'utilizadores', 'emprestimos', 'reservas'
  const [activeTab, setActiveTab] = useState('livros');
  
  // ------------------------------------------
  // ESTADO: DADOS DAS TABELAS
  // ------------------------------------------
  // Cada array guarda os dados carregados do servidor para cada secção
  const [livros, setLivros] = useState([]); // Lista de todos os livros
  const [utilizadores, setUtilizadores] = useState([]); // Lista de todos os utilizadores
  const [emprestimos, setEmprestimos] = useState([]); // Lista de todos os empréstimos
  const [reservas, setReservas] = useState([]); // Lista de todas as reservas
  
  // ------------------------------------------
  // ESTADO: CONTROLO DE UI (Interface)
  // ------------------------------------------
  const [loading, setLoading] = useState(false); // true = a carregar dados, mostra spinner
  const [showModal, setShowModal] = useState(false); // true = janela modal visível
  const [modalType, setModalType] = useState(''); // Tipo de modal: 'livro', etc.
  const [formData, setFormData] = useState({}); // Dados do formulário dentro do modal
  
  // ------------------------------------------
  // FUNÇÃO AUXILIAR: FORMATAR DATA
  // ------------------------------------------
  // Converte datas ISO (2024-12-12T00:00:00.000Z) para formato HTML (2024-12-12)
  // Usado nos campos <input type="date">
  // 
  // Exemplo:
  // formatDateForInput('2024-12-12T10:30:00.000Z') → '2024-12-12'
  const formatDateForInput = (isoDate) => {
    if (!isoDate) return ''; // Se não há data, retorna vazio
    try {
      // Dividir a string pela letra 'T' e pegar só a primeira parte (YYYY-MM-DD)
      return isoDate.split('T')[0];
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  };

  // ------------------------------------------
  // EFEITO: CARREGAR DADOS AO MUDAR DE TAB
  // ------------------------------------------
  // Sempre que o utilizador muda de separador (livros → utilizadores, etc.),
  // este efeito executa loadData() para buscar os novos dados do servidor
  useEffect(() => {
    loadData();
  }, [activeTab]); // Executa quando activeTab muda

  // ------------------------------------------
  // FUNÇÃO: CARREGAR DADOS DO SERVIDOR
  // ------------------------------------------
  // Esta função faz um pedido ao servidor (API) para buscar dados
  // dependendo do separador (tab) que está ativo
  // 
  // FLUXO:
  // 1. Ativa o estado de loading (mostra spinner de carregamento)
  // 2. Faz pedido GET ao endpoint correto (/livros, /utilizadores, etc.)
  // 3. Guarda os dados recebidos no estado correspondente
  // 4. Se houver erro, mostra mensagem de alerta
  // 5. Desativa o loading (esconde spinner)
  const loadData = async () => {
    setLoading(true); // Mostrar indicador "A carregar..."
    try {
      // Switch decide qual endpoint chamar baseado no tab ativo
      switch(activeTab) {
        case 'livros':
          // Buscar todos os livros do catálogo
          const livrosRes = await api.get('/livros');
          setLivros(livrosRes.data.data || []); // Guardar no estado
          break;
        case 'utilizadores':
          // Buscar todos os utilizadores registados
          const usersRes = await api.get('/utilizadores');
          setUtilizadores(usersRes.data.data || []);
          break;
        case 'emprestimos':
          // Buscar todos os empréstimos (ativos e histórico)
          const empRes = await api.get('/emprestimos');
          setEmprestimos(empRes.data.data || []);
          break;
        case 'reservas':
          // Buscar todas as reservas (pendentes, processadas, canceladas)
          const resRes = await api.get('/reservas');
          setReservas(resRes.data.data || []);
          break;
      }
    } catch (error) {
      // Se houver erro (servidor offline, sem permissões, etc.), mostrar mensagem
      alert('Erro ao carregar dados: ' + (error.response?.data?.message || error.message));
    } finally {
      // Finally executa SEMPRE, mesmo se der erro
      // Usado para garantir que o loading seja desativado
      setLoading(false);
    }
  };

  // ==========================================
  // GESTÃO DE LIVROS
  // ==========================================
  
  // ------------------------------------------
  // FUNÇÃO: GUARDAR LIVRO (Adicionar ou Editar)
  // ------------------------------------------
  // Esta função trata tanto de adicionar um livro NOVO como de EDITAR um existente
  // A diferença é: se formData tem id_livro → está a editar, se não tem → está a adicionar
  // 
  // LÓGICA ESPECIAL - GESTÃO DE CÓPIAS:
  // Quando editamos um livro e aumentamos o total_copias (ex: de 5 para 8):
  // - As copias_disponiveis também aumentam automaticamente (diferença de +3)
  // - Isto porque as cópias novas adicionadas estão disponíveis
  // 
  // Quando diminuímos o total_copias (ex: de 8 para 6):
  // - As copias_disponiveis diminuem automaticamente (diferença de -2)
  // - Mas NUNCA ficam negativas (mínimo é 0)
  const handleSaveLivro = async (e) => {
    e.preventDefault(); // Impedir reload da página ao submeter formulário
   try {
      const dataToSend = { ...formData }; // Copiar dados do formulário
      
      // ------------------------------------------
      // AJUSTAR CÓPIAS DISPONÍVEIS AO EDITAR
      // ------------------------------------------
      // Se está editando (tem id_livro) E mudou o número total de cópias
      if (formData.id_livro && formData.total_copias_original !== undefined) {
        const copiasOriginais = parseInt(formData.total_copias_original) || 0; // Ex: 5
        const novoTotal = parseInt(formData.total_copias) || 0; // Ex: 8
        const diferenca = novoTotal - copiasOriginais; // Ex: 8 - 5 = +3
        
        // Se houve mudança no total (diferença ≠ 0)
        if (diferenca !== 0) {
          const disponiveisAtuais = parseInt(formData.copias_disponiveis) || 0; // Ex: 3
          dataToSend.copias_disponiveis = disponiveisAtuais + diferenca; // Ex: 3 + 3 = 6
          
          // Garantir que nunca fica negativo
          // (pode acontecer se diminuir cópias e muitas estarem emprestadas)
          if (dataToSend.copias_disponiveis < 0) {
            dataToSend.copias_disponiveis = 0;
          }
        }
      }
      
      // Remover campo auxiliar que não existe na base de dados
      // (usado apenas para calcular a diferença)
      delete dataToSend.total_copias_original;

      // ------------------------------------------
      // DECIDIR: ATUALIZAR OU ADICIONAR?
      // ------------------------------------------
      if (formData.id_livro) {
        // TEM id_livro → É uma EDIÇÃO de livro existente
        await api.put(`/livros/${formData.id_livro}`, dataToSend); // PUT = atualizar
        alert('Livro atualizado!'); // Mensagem de sucesso
      } else {
        // NÃO TEM id_livro → É um livro NOVO
        // Ao adicionar novo livro, copias_disponiveis começa igual ao total
        // (todas as cópias estão disponíveis porque é novo)
        if (!dataToSend.copias_disponiveis) {
          dataToSend.copias_disponiveis = dataToSend.total_copias || 0;
        }
        await api.post('/livros', dataToSend); // POST = criar novo
        alert('Livro adicionado!'); // Mensagem de sucesso
      }
      
      // ------------------------------------------
      // LIMPAR E RECARREGAR
      // ------------------------------------------
      setShowModal(false); // Fechar o modal
      setFormData({}); // Limpar formulário para próxima vez
      loadData(); // Recarregar lista de livros para ver as alterações

    } catch (error) {
      // Se algo correr mal (ISBN duplicado, campo inválido, etc.)
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  // ------------------------------------------
  // FUNÇÃO: ELIMINAR LIVRO
  // ------------------------------------------
  // Remove um livro permanentemente da base de dados
  // 
  // IMPORTANTE: Só funciona se o livro NÃO tiver empréstimos ou reservas ativos!
  // O backend rejeita a eliminação se houver dependências
  // 
  // Fluxo:
  // 1. Pedir confirmação ao utilizador (window.confirm)
  // 2. Se confirmar, fazer pedido DELETE ao servidor
  // 3. Mostrar mensagem de sucesso
  // 4. Recarregar a lista para remover o livro eliminado do ecrã
  const handleDeleteLivro = async (id) => {
    // Janela de confirmação nativa do navegador
    // Retorna true se clicar "OK", false se clicar "Cancelar"
    if (!window.confirm('Eliminar este livro?')) return; // Se cancelar, sair da função
    
    try {
      await api.delete(`/livros/${id}`); // DELETE = eliminar permanentemente
      alert('Livro eliminado!'); // Mensagem de sucesso
      loadData(); // Recarregar lista atualizada
    } catch (error) {
      // Erro comum: "Não é possível eliminar livro com empréstimos ativos"
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  // ==========================================
  // GESTÃO DE EMPRÉSTIMOS
  // ==========================================
  
  // ------------------------------------------
  // FUNÇÃO: DEVOLVER EMPRÉSTIMO
  // ------------------------------------------
  // Marca um empréstimo como devolvido (registar devolução)
  // 
  // O que acontece no backend:
  // - Define data_devolucao_efetiva = data/hora atual
  // - Calcula multa se houver atraso (dias em atraso × 0.50€)
  // - Liberta uma cópia do livro (copias_disponiveis +1)
  // - Muda estado para 'devolvido'
  const handleDevolverEmprestimo = async (id) => {
    if (!window.confirm('Confirmar devolução?')) return; // Pedir confirmação
    
    try {
      await api.put(`/emprestimos/${id}/devolver`); // PUT para atualizar estado
      alert('Devolução registada!'); // Mensagem de sucesso
      loadData(); // Recarregar lista para ver mudanças
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  // ==========================================
  // GESTÃO DE RESERVAS
  // ==========================================
  
  // ------------------------------------------
  // FUNÇÃO: CANCELAR RESERVA
  // ------------------------------------------
  // Cancela uma reserva (não converte em empréstimo)
  // Usado quando: utilizador desiste, livro foi danificado, etc.
  // 
  // O que acontece:
  // - Muda estado da reserva para 'cancelada'
  // - NÃO liberta cópias (porque nunca foram "presas")
  const handleCancelarReserva = async (id) => {
    if (!window.confirm('Cancelar esta reserva?')) return;
    
    try {
      await api.put(`/reservas/${id}/cancelar`);
      alert('Reserva cancelada!');
      loadData();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  // ------------------------------------------
  // FUNÇÃO: PROCESSAR RESERVA
  // ------------------------------------------
  // Converte uma reserva em empréstimo ativo
  // Usado quando o utilizador vem buscar o livro reservado
  // 
  // O que acontece no backend:
  // 1. Verifica se ainda há cópias disponíveis
  // 2. Cria um novo empréstimo associado ao utilizador e livro
  // 3. Define data_emprestimo = hoje e data_devolucao_prevista = hoje + 14 dias
  // 4. Diminui copias_disponiveis em 1
  // 5. Marca a reserva como 'processada'
  const handleProcessarReserva = async (id) => {
    if (!window.confirm('Processar reserva e criar empréstimo?')) return;
    
    try {
      await api.post(`/reservas/${id}/processar`); // POST porque cria um empréstimo novo
      alert('Reserva processada! Empréstimo criado com sucesso.');
      loadData(); // Recarregar para ver empréstimo novo e reserva processada
    } catch (error) {
      // Erro comum: "Não há cópias disponíveis"
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  // ==========================================
  // GESTÃO DE UTILIZADORES
  // ==========================================
  
  // ------------------------------------------
  // FUNÇÃO: ALTERAR TIPO DE UTILIZADOR
  // ------------------------------------------
  // Muda o tipo de conta de um utilizador
  // Tipos disponíveis:
  // - 'aluno': Utilizador normal, pode reservar e pedir empréstimos
  // - 'professor': Utilizador normal com mesmo acesso (diferenciação futura)
  // - 'bibliotecario': Admin com acesso a esta página de administração
  // 
  // CUIDADO: Se mudar um bibliotecário para aluno, ele perde acesso a esta página!
  const handleAlterarTipo = async (id, novoTipo) => {
    try {
      await api.put(`/utilizadores/${id}/tipo`, { tipo: novoTipo });
      alert('Tipo de utilizador atualizado!');
      loadData(); // Recarregar para ver alteração
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  // ==========================================
  // RENDERIZAÇÃO (INTERFACE)
  // ==========================================
  return (
    <div className="catalog-container">
      {/* ------------------------------------------
          CABEÇALHO (Header)
          ------------------------------------------
          Mostra a barra de navegação no topo
          activePage="admin" destaca o botão Admin no menu
      */}
      <Header activePage="admin" setCurrentPage={setCurrentPage} />
      
      <main className="catalog-main" role="main">
        <h1 className="catalog-title">ADMINISTRAÇÃO</h1>
        
        {/* ------------------------------------------
            SEPARADORES (TABS)
            ------------------------------------------
            4 botões para alternar entre secções:
            - 📚 Livros: Gerir catálogo
            - 👥 Utilizadores: Ver e alterar tipos de utilizadores
            - 📖 Empréstimos: Registar devoluções
            - 🔖 Reservas: Processar ou cancelar reservas
            
            O botão ativo tem a classe 'admin-tab-active'
        */}
        <div className="admin-tabs">
          <button 
            className={activeTab === 'livros' ? 'admin-tab-active' : 'admin-tab'}
            onClick={() => setActiveTab('livros')}
          >
            📚 Livros
          </button>
          <button 
            className={activeTab === 'utilizadores' ? 'admin-tab-active' : 'admin-tab'}
            onClick={() => setActiveTab('utilizadores')}
          >
            👥 Utilizadores
          </button>
          <button 
            className={activeTab === 'emprestimos' ? 'admin-tab-active' : 'admin-tab'}
            onClick={() => setActiveTab('emprestimos')}
          >
            📖 Empréstimos
          </button>
          <button 
            className={activeTab === 'reservas' ? 'admin-tab-active' : 'admin-tab'}
            onClick={() => setActiveTab('reservas')}
          >
            🔖 Reservas
          </button>
        </div>

        {/* ------------------------------------------
            CAIXA DE CONTEÚDO
            ------------------------------------------
            Contém a tabela ou mensagem de loading
        */}
        <div className="details-box" style={{ marginTop: '2rem' }}>
          {loading ? (
            // ------------------------------------------
            // ESTADO DE LOADING (A carregar...)
            // ------------------------------------------
            <div className="empty-state">A carregar...</div>
          ) : (
            <>
              {/* ==========================================
                  TAB LIVROS
                  ==========================================
                  Mostra tabela com todos os livros do catálogo
                  Permite adicionar novos, editar existentes ou eliminar
              */}
              {activeTab === 'livros' && (
                <>
                  {/* Botão para adicionar livro novo */}
                  <div style={{ marginBottom: '1rem' }}>
                    <button 
                      className="primary-button"
                      onClick={() => {
                        setModalType('livro'); // Define tipo de modal
                        // Valores iniciais para livro novo
                        setFormData({
                          total_copias: 1,
                          copias_disponiveis: 1
                        });
                        setShowModal(true); // Abrir modal
                      }}
                    >
                      + Adicionar Livro
                    </button>
                  </div>
                  
                  {/* ------------------------------------------
                      TABELA DE LIVROS
                      ------------------------------------------
                      Colunas:
                      - ID: Identificador único do livro
                      - Título: Nome do livro
                      - Autor: Quem escreveu
                      - ISBN: Código internacional do livro
                      - Categoria: Tipo de livro (ficção, técnico, etc.)
                      - Total Cópias: Quantas cópias a biblioteca tem
                      - Disponíveis: Quantas podem ser emprestadas agora
                      - Ações: Botões Editar e Eliminar
                  */}
                  <div className="admin-table">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Título</th>
                          <th>Autor</th>
                          <th>ISBN</th>
                          <th>Categoria</th>
                          <th>Total Cópias</th>
                          <th>Disponíveis</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Percorrer array de livros e criar uma linha para cada */}
                        {livros.map(livro => (
                          <tr key={livro.id_livro}>
                            <td>{livro.id_livro}</td>
                            <td>{livro.titulo}</td>
                            <td>{livro.autor}</td>
                            <td>{livro.isbn}</td>
                            <td>{livro.categoria}</td>
                            <td>{livro.total_copias || 0}</td>
                            <td>{livro.copias_disponiveis || 0}</td>
                            <td>
                              {/* Botão EDITAR: Abre modal com dados do livro */}
                              <button 
                                className="admin-btn-edit"
                                onClick={() => {
                                  setModalType('livro');
                                  setFormData({
                                    ...livro, // Copiar todos os dados do livro
                                    // Formatar data para campo input type="date"
                                    data_publicacao: formatDateForInput(livro.data_publicacao),
                                    // Guardar valor original para calcular diferença
                                    total_copias_original: livro.total_copias || 0
                                  });
                                  setShowModal(true);
                                }}
                              >
                                Editar
                              </button>
                              {/* Botão ELIMINAR: Remove livro permanentemente */}
                              <button 
                                className="admin-btn-delete"
                                onClick={() => handleDeleteLivro(livro.id_livro)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ==========================================
                  TAB UTILIZADORES
                  ==========================================
                  Mostra lista de todos os utilizadores registados
                  Permite alterar o tipo de cada utilizador (aluno/professor/bibliotecário)
              */}
              {activeTab === 'utilizadores' && (
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Tipo</th>
                        <th>Data Registo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Percorrer array de utilizadores */}
                      {utilizadores.map(user => (
                        <tr key={user.id_utilizador}>
                          <td>{user.id_utilizador}</td>
                          <td>{user.nome}</td>
                          <td>{user.email}</td>
                          <td>
                            {/* ------------------------------------------
                                DROPDOWN PARA ALTERAR TIPO
                                ------------------------------------------
                                Select que permite mudar o tipo diretamente
                                onChange chama handleAlterarTipo automaticamente
                            */}
                            <select
                              className="admin-select-tipo"
                              value={user.tipo}
                              onChange={(e) => handleAlterarTipo(user.id_utilizador, e.target.value)}
                            >
                              <option value="aluno">Aluno</option>
                              <option value="professor">Professor</option>
                              <option value="bibliotecario">Bibliotecário</option>
                            </select>
                          </td>
                          <td>{new Date(user.data_criacao).toLocaleDateString('pt-PT')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ==========================================
                  TAB EMPRÉSTIMOS
                  ==========================================
                  Mostra todos os empréstimos (ativos e devolvidos)
                  Permite registar devolução para empréstimos ativos
                  
                  Estados possíveis:
                  - 'ativo': Empréstimo em curso, livro ainda não foi devolvido
                  - 'devolvido': Livro já foi entregue de volta
                  - 'atrasado': Passou da data prevista e não foi devolvido
              */}
              {activeTab === 'emprestimos' && (
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Livro</th>
                        <th>Utilizador</th>
                        <th>Data Empréstimo</th>
                        <th>Data Prevista</th>
                        <th>Data Devolução</th>
                        <th>Estado</th>
                        <th>Multa</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emprestimos.map(emp => (
                        <tr key={emp.id_emprestimo}>
                          <td>{emp.id_emprestimo}</td>
                          <td>{emp.titulo}</td>
                          <td>{emp.nome_utilizador}</td>
                          {/* Formatar datas para formato português (DD/MM/YYYY) */}
                          <td>{new Date(emp.data_emprestimo).toLocaleDateString('pt-PT')}</td>
                          <td>{new Date(emp.data_devolucao_prevista).toLocaleDateString('pt-PT')}</td>
                          {/* Se não foi devolvido ainda, mostrar "-" */}
                          <td>{emp.data_devolucao_efetiva ? new Date(emp.data_devolucao_efetiva).toLocaleDateString('pt-PT') : '-'}</td>
                          <td>{emp.estado}</td>
                          <td>{emp.multa}€</td>
                          <td>
                            {/* ------------------------------------------
                                BOTÃO DEVOLVER
                                ------------------------------------------
                                Só aparece se ainda NÃO foi devolvido
                                (!emp.data_devolucao_efetiva = sem data de devolução)
                            */}
                            {!emp.data_devolucao_efetiva && (
                              <button 
                                className="admin-btn-edit"
                                onClick={() => handleDevolverEmprestimo(emp.id_emprestimo)}
                              >
                                Devolver
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ==========================================
                  TAB RESERVAS
                  ==========================================
                  Mostra todas as reservas (pendentes, processadas, canceladas)
                  
                  Ações disponíveis:
                  - PROCESSAR: Converte reserva em empréstimo (utilizador veio buscar)
                  - CANCELAR: Cancela a reserva (utilizador desistiu)
                  
                  Estados possíveis:
                  - 'pendente': Aguardando processamento
                  - 'processada': Já convertida em empréstimo
                  - 'cancelada': Reserva foi cancelada
                  - 'expirada': Passou do prazo e não foi processada
              */}
              {activeTab === 'reservas' && (
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Livro</th>
                        <th>Utilizador</th>
                        <th>Data Reserva</th>
                        <th>Data Expiração</th>
                        <th>Estado</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservas.map(res => (
                        <tr key={res.id_reserva}>
                          <td>{res.id_reserva}</td>
                          <td>{res.titulo}</td>
                          <td>{res.nome_utilizador}</td>
                          <td>{new Date(res.data_reserva).toLocaleDateString('pt-PT')}</td>
                          <td>{new Date(res.data_expiracao).toLocaleDateString('pt-PT')}</td>
                          <td>{res.estado}</td>
                          <td>
                            {/* ------------------------------------------
                                BOTÃO PROCESSAR
                                ------------------------------------------
                                Converte a reserva em empréstimo ativo
                                Usado quando utilizador vem buscar o livro
                            */}
                            <button 
                              className="admin-btn-edit"
                              onClick={() => handleProcessarReserva(res.id_reserva)}
                            >
                              Processar
                            </button>
                            {/* ------------------------------------------
                                BOTÃO CANCELAR
                                ------------------------------------------
                                Cancela a reserva sem criar empréstimo
                            */}
                            <button 
                              className="admin-btn-delete"
                              onClick={() => handleCancelarReserva(res.id_reserva)}
                            >
                              Cancelar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ==========================================
          MODAL - ADICIONAR/EDITAR LIVRO
          ==========================================
          Janela (modal) que aparece por cima da página quando:
          - Clicar em "+ Adicionar Livro" (formulário vazio)
          - Clicar em "Editar" num livro (formulário preenchido com dados)
          
          Só é visível se: showModal = true E modalType = 'livro'
      */}
      {showModal && modalType === 'livro' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          {/* ------------------------------------------
              CONTEÚDO DO MODAL
              ------------------------------------------
              onClick={(e) => e.stopPropagation()} impede que clicar
              dentro do modal o feche (só fecha se clicar fora, no overlay)
          */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Cabeçalho do modal com título dinâmico */}
            <div className="modal-header">
              <h2 className="modal-title">
                {/* Se tem id_livro = está editando, senão = está adicionando */}
                {formData.id_livro ? 'Editar Livro' : 'Adicionar Livro'}
              </h2>
            </div>
            
            {/* ------------------------------------------
                CORPO DO MODAL - FORMULÁRIO
                ------------------------------------------
                Contém todos os campos para criar/editar um livro
            */}
            <div className="modal-body">
              {/* Form com ID para poder submeter de fora (botão no footer) */}
              <form onSubmit={handleSaveLivro} id="livroForm">
                {/* ------------------------------------------
                    CAMPO: TÍTULO
                    ------------------------------------------
                    Campo obrigatório (required)
                    Valor controlado: value={formData.titulo}
                */}
                <div className="input-group">
                  <label className="label">Título *</label>
                  <input
                    className="input"
                    value={formData.titulo || ''}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    required
                  />
                </div>
                
                {/* CAMPO: AUTOR */}
                <div className="input-group">
                  <label className="label">Autor *</label>
                  <input
                    className="input"
                    value={formData.autor || ''}
                    onChange={(e) => setFormData({...formData, autor: e.target.value})}
                    required
                  />
                </div>
                
                {/* CAMPO: ISBN (código único do livro) */}
                <div className="input-group">
                  <label className="label">ISBN *</label>
                  <input
                    className="input"
                    value={formData.isbn || ''}
                    onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                    required
                  />
                </div>
                
                {/* CAMPO: CATEGORIA (ficção, técnico, infantil, etc.) */}
                <div className="input-group">
                  <label className="label">Categoria *</label>
                  <input
                    className="input"
                    value={formData.categoria || ''}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    required
                  />
                </div>
                
                {/* CAMPO: DATA DE PUBLICAÇÃO */}
                <div className="input-group">
                  <label className="label">Data de Publicação *</label>
                  <input
                    className="input"
                    type="date"
                    value={formData.data_publicacao || ''}
                    onChange={(e) => setFormData({...formData, data_publicacao: e.target.value})}
                    required
                  />
                </div>
                
                {/* ------------------------------------------
                    CAMPO: TOTAL DE CÓPIAS
                    ------------------------------------------
                    Campo especial com indicador de diferença ao editar
                    Mostra quantas cópias estão a ser adicionadas/removidas
                */}
                <div className="input-group">
                  <label className="label">Total de Cópias *</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={formData.total_copias || 0}
                    onChange={(e) => setFormData({...formData, total_copias: e.target.value})}
                    required
                  />
                  {/* Só mostra indicador se estiver EDITANDO e tiver valor original guardado */}
                  {formData.id_livro && formData.total_copias_original !== undefined && (
                    <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                      Atual: {formData.total_copias_original} cópias
                      {/* Se o valor mudou, mostrar diferença em azul */}
                      {parseInt(formData.total_copias) !== parseInt(formData.total_copias_original) && (
                        <span style={{ color: '#2563EB', fontWeight: 600 }}>
                          {' '}→ Diferença: {parseInt(formData.total_copias) - parseInt(formData.total_copias_original) > 0 ? '+' : ''}
                          {parseInt(formData.total_copias) - parseInt(formData.total_copias_original)}
                        </span>
                      )}
                    </small>
                  )}
                </div>
                
                {/* ------------------------------------------
                    CAMPO: CÓPIAS DISPONÍVEIS
                    ------------------------------------------
                    Campo READ-ONLY (só leitura, não editável)
                    É calculado automaticamente pelo sistema
                */}
                <div className="input-group">
                  <label className="label">Cópias Disponíveis</label>
                  <input
                    className="input"
                    type="number"
                    value={formData.copias_disponiveis || 0}
                    readOnly // Não pode ser editado
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  {/* Texto explicativo de como funciona o ajuste automático */}
                  <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                    {formData.id_livro 
                      ? 'Será ajustado automaticamente ao mudar o total' 
                      : 'Será igual ao total de cópias'}
                  </small>
                </div>
                
                {/* CAMPO: DESCRIÇÃO (opcional, texto longo) */}
                <div className="input-group">
                  <label className="label">Descrição</label>
                  <textarea
                    className="textarea"
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  />
                </div>
              </form>
            </div>
            
            {/* ------------------------------------------
                RODAPÉ DO MODAL - BOTÕES DE AÇÃO
                ------------------------------------------
                Botões para confirmar ou cancelar a operação
            */}
            <div className="modal-footer">
              {/* Botão CANCELAR: Fecha o modal sem guardar */}
              <button 
                type="button" 
                className="modal-button modal-button-cancel" 
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              {/* Botão CONFIRMAR: Submete o formulário */}
              <button 
                type="submit" 
                form="livroForm" 
                className="modal-button modal-button-confirm"
              >
                {/* Texto dinâmico: "Atualizar" se editando, "Adicionar" se novo */}
                {formData.id_livro ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;