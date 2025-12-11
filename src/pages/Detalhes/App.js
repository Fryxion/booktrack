import React, { useState } from 'react';
import Header from '../../components/Header/App';
import { reservasAPI } from '../../services/api';
import '../../styles/App.css';

const DetalhesPage = ({ selectedBook, setCurrentPage, showToast }) => {
  const [isReserving, setIsReserving] = useState(false);

  if (!selectedBook) return null;

  const handleReservar = async () => {
    try {
      setIsReserving(true);
      
      const response = await reservasAPI.create(selectedBook.id_livro);
      
      if (response.success) {
        showToast('Reserva efetuada com sucesso! Receberá uma notificação quando o livro estiver disponível.', 'success');
        setTimeout(() => {
          setCurrentPage('catalogo');
        }, 1500);
      } else {
        showToast(response.message || 'Erro ao efetuar reserva', 'error');
      }
    } catch (error) {
      console.error('Erro ao reservar:', error);
      const message = error.response?.data?.message || 'Erro ao efetuar reserva';
      showToast(message, 'error');
    } finally {
      setIsReserving(false);
    }
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
  };

  const disponivel = selectedBook.copias_disponiveis > 0;

  return (
    <div className="details-container">
      <Header activePage="catalogo" setCurrentPage={setCurrentPage} />
      
      <main className="details-main" role="main">
        <h1 className="catalog-title">DETALHES DO LIVRO</h1>
        
        <div className="details-box">
          <div className="details-top">
            <div className="details-cover">📚</div>
            
            <div className="description">
              <p>{selectedBook.descricao || 'Sem descrição disponível.'}</p>
            </div>
          </div>

          <div className="info-fields">
            <div className="info-field">
              <label className="field-label">Título</label>
              <div className="field-value">{selectedBook.titulo}</div>
            </div>

            <div className="info-field">
              <label className="field-label">Autor</label>
              <div className="field-value">{selectedBook.autor}</div>
            </div>

            <div className="info-field">
              <label className="field-label">ISBN</label>
              <div className="field-value">{selectedBook.isbn}</div>
            </div>

            <div className="info-field">
              <label className="field-label">Categoria</label>
              <div className="field-value">{selectedBook.categoria}</div>
            </div>

            <div className="info-field">
              <label className="field-label">Data de Publicação</label>
              <div className="field-value">{formatDate(selectedBook.data_publicacao)}</div>
            </div>

            <div className="info-field">
              <label className="field-label">Disponibilidade</label>
              <div className="field-value">
                {disponivel ? (
                  <span className="badge badge-available">
                    Disponível ({selectedBook.copias_disponiveis} de {selectedBook.total_copias} cópias)
                  </span>
                ) : (
                  <span className="badge badge-unavailable">
                    Indisponível (0 de {selectedBook.total_copias} cópias)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={() => setCurrentPage('catalogo')}
              className="back-button"
            >
              Voltar
            </button>
            {disponivel ? (
              <button
                onClick={handleReservar}
                className="reserve-button"
                disabled={isReserving}
              >
                {isReserving ? (
                  <span className="button-loading">
                    <span className="spinner"></span>
                    A reservar...
                  </span>
                ) : (
                  'Reservar'
                )}
              </button>
            ) : (
              <button 
                disabled 
                className="disabled-button"
                title="Livro indisponível no momento"
              >
                Indisponível
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetalhesPage;
