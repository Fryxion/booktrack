import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/App';
import '../../styles/App.css';
import '../../styles/Admin.css';
import api from '../../services/api';

const AdminPage = ({ setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('livros');
  const [livros, setLivros] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return '';
    try {
      // Extrair apenas YYYY-MM-DD da string ISO
      return isoDate.split('T')[0];
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  };

  // Carregar dados ao mudar de tab
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch(activeTab) {
        case 'livros':
          const livrosRes = await api.get('/livros');
          setLivros(livrosRes.data.data || []);
          break;
        case 'utilizadores':
          const usersRes = await api.get('/utilizadores');
          setUtilizadores(usersRes.data.data || []);
          break;
        case 'emprestimos':
          const empRes = await api.get('/emprestimos');
          setEmprestimos(empRes.data.data || []);
          break;
        case 'reservas':
          const resRes = await api.get('/reservas');
          setReservas(resRes.data.data || []);
          break;
      }
    } catch (error) {
      alert('Erro ao carregar dados: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // LIVROS - Adicionar/Editar
  const handleSaveLivro = async (e) => {
    e.preventDefault();
   try {
      const dataToSend = { ...formData };
      
      // Se está editando e mudou o total_copias, ajustar copias_disponiveis
      if (formData.id_livro && formData.total_copias_original !== undefined) {
        const copiasOriginais = parseInt(formData.total_copias_original) || 0;
        const novoTotal = parseInt(formData.total_copias) || 0;
        const diferenca = novoTotal - copiasOriginais;
        
        if (diferenca !== 0) {
          const disponiveisAtuais = parseInt(formData.copias_disponiveis) || 0;
          dataToSend.copias_disponiveis = disponiveisAtuais + diferenca;
          
          // Não pode ficar negativo
          if (dataToSend.copias_disponiveis < 0) {
            dataToSend.copias_disponiveis = 0;
          }
        }
      }
      
      // Remover campo auxiliar antes de enviar
      delete dataToSend.total_copias_original;

      if (formData.id_livro) {
        await api.put(`/livros/${formData.id_livro}`, dataToSend);
        alert('Livro atualizado!');
      } else {
        // Ao adicionar novo livro, copias_disponiveis = total_copias
        if (!dataToSend.copias_disponiveis) {
          dataToSend.copias_disponiveis = dataToSend.total_copias || 0;
        }
        await api.post('/livros', dataToSend);
        alert('Livro adicionado!');
      }
      setShowModal(false);
      setFormData({});
      loadData();

    } catch (error) {
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  // LIVROS - Eliminar
  const handleDeleteLivro = async (id) => {
    if (!window.confirm('Eliminar este livro?')) return;
    try {
      await api.delete(`/livros/${id}`);
      alert('Livro eliminado!');
      loadData();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  // EMPRÉSTIMOS - Devolver
  const handleDevolverEmprestimo = async (id) => {
    if (!window.confirm('Confirmar devolução?')) return;
    try {
      await api.put(`/emprestimos/${id}/devolver`);
      alert('Devolução registada!');
      loadData();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  // RESERVAS - Cancelar
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

  // RESERVAS - Processar (converter em empréstimo)
  const handleProcessarReserva = async (id) => {
    if (!window.confirm('Processar reserva e criar empréstimo?')) return;
    try {
      await api.post(`/reservas/${id}/processar`);
      alert('Reserva processada! Empréstimo criado com sucesso.');
      loadData();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  // UTILIZADORES - Alterar Tipo
  const handleAlterarTipo = async (id, novoTipo) => {
    try {
      await api.put(`/utilizadores/${id}/tipo`, { tipo: novoTipo });
      alert('Tipo de utilizador atualizado!');
      loadData();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="catalog-container">
      <Header activePage="admin" setCurrentPage={setCurrentPage} />
      
      <main className="catalog-main" role="main">
        <h1 className="catalog-title">ADMINISTRAÇÃO</h1>
        
        {/* TABS */}
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

        <div className="details-box" style={{ marginTop: '2rem' }}>
          {loading ? (
            <div className="empty-state">A carregar...</div>
          ) : (
            <>
              {/* TAB LIVROS */}
              {activeTab === 'livros' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <button 
                      className="primary-button"
                      onClick={() => {
                        setModalType('livro');
                        setFormData({
                          total_copias: 1,
                          copias_disponiveis: 1
                        });
                        setShowModal(true);
                      }}
                    >
                      + Adicionar Livro
                    </button>
                  </div>
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
                              <button 
                                className="admin-btn-edit"
                                onClick={() => {
                                  setModalType('livro');
                                  setFormData({
                                    ...livro,
                                    data_publicacao: formatDateForInput(livro.data_publicacao),
                                    total_copias_original: livro.total_copias || 0
                                  });
                                  setShowModal(true);
                                }}
                              >
                                Editar
                              </button>
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

              {/* TAB UTILIZADORES */}
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
                      {utilizadores.map(user => (
                        <tr key={user.id_utilizador}>
                          <td>{user.id_utilizador}</td>
                          <td>{user.nome}</td>
                          <td>{user.email}</td>
                          <td>
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

              {/* TAB EMPRÉSTIMOS */}
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
                          <td>{new Date(emp.data_emprestimo).toLocaleDateString('pt-PT')}</td>
                          <td>{new Date(emp.data_devolucao_prevista).toLocaleDateString('pt-PT')}</td>
                          <td>{emp.data_devolucao_efetiva ? new Date(emp.data_devolucao_efetiva).toLocaleDateString('pt-PT') : '-'}</td>
                          <td>{emp.estado}</td>
                          <td>{emp.multa}€</td>
                          <td>
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

              {/* TAB RESERVAS */}
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
                            <button 
                              className="admin-btn-edit"
                              onClick={() => handleProcessarReserva(res.id_reserva)}
                            >
                              Processar
                            </button>
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

      {/* MODAL PARA ADICIONAR/EDITAR LIVRO */}
      {showModal && modalType === 'livro' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{formData.id_livro ? 'Editar Livro' : 'Adicionar Livro'}</h2>
            </div>
            <div className="modal-body">
            <form onSubmit={handleSaveLivro} id="livroForm">              
                <div className="input-group">
                  <label className="label">Título *</label>
                  <input
                    className="input"
                    value={formData.titulo || ''}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="label">Autor *</label>
                  <input
                    className="input"
                    value={formData.autor || ''}
                    onChange={(e) => setFormData({...formData, autor: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="label">ISBN *</label>
                  <input
                    className="input"
                    value={formData.isbn || ''}
                    onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="label">Categoria *</label>
                  <input
                    className="input"
                    value={formData.categoria || ''}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    required
                  />
                </div>
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
                  {formData.id_livro && formData.total_copias_original !== undefined && (
                    <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                      Atual: {formData.total_copias_original} cópias
                      {parseInt(formData.total_copias) !== parseInt(formData.total_copias_original) && (
                        <span style={{ color: '#2563EB', fontWeight: 600 }}>
                          {' '}→ Diferença: {parseInt(formData.total_copias) - parseInt(formData.total_copias_original) > 0 ? '+' : ''}
                          {parseInt(formData.total_copias) - parseInt(formData.total_copias_original)}
                        </span>
                      )}
                    </small>
                  )}
                </div>
                <div className="input-group">
                  <label className="label">Cópias Disponíveis</label>
                  <input
                    className="input"
                    type="number"
                    value={formData.copias_disponiveis || 0}
                    readOnly
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                    {formData.id_livro ? 'Será ajustado automaticamente ao mudar o total' : 'Será igual ao total de cópias'}
                  </small>
                </div>
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
              <div className="modal-footer">
                <button type="button" className="modal-button modal-button-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" form="livroForm" className="modal-button modal-button-confirm">
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