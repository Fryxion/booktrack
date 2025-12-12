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
      if (formData.id_livro) {
        await api.put(`/livros/${formData.id_livro}`, formData);
        alert('Livro atualizado!');
      } else {
        await api.post('/livros', formData);
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
      await api.delete(`/reservas/${id}`);
      alert('Reserva cancelada!');
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
                        setFormData({});
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
                          <th>Disponível</th>
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
                            <td>{livro.disponivel ? '✅' : '❌'}</td>
                            <td>
                              <button 
                                className="admin-btn-edit"
                                onClick={() => {
                                  setModalType('livro');
                                  setFormData(livro);
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
                          <td>{user.tipo}</td>
                          <td>{new Date(user.data_registo).toLocaleDateString('pt-PT')}</td>
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
                          <td>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{formData.id_livro ? 'Editar Livro' : 'Adicionar Livro'}</h2>
            </div>
            <form onSubmit={handleSaveLivro}>
              <div className="modal-body">
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
                  <label className="label">Descrição</label>
                  <textarea
                    className="textarea"
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  />
                </div>
                <div className="checkbox">
                  <input
                    type="checkbox"
                    id="disponivel"
                    checked={formData.disponivel !== false}
                    onChange={(e) => setFormData({...formData, disponivel: e.target.checked})}
                  />
                  <label htmlFor="disponivel">Disponível</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-button modal-button-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="modal-button modal-button-confirm">
                  {formData.id_livro ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;