import React from 'react';
import Header from '../../components/Header/App';
import '../../styles/App.css';

const DetalhesPage = ({ selectedBook, setCurrentPage, handleReservar }) => {
  if (!selectedBook) return null;

  return (
    <div className="details-container">
      <Header activePage="catalogo" setCurrentPage={setCurrentPage} />
      
      <main className="details-main" role="main">
        <h1 className="catalog-title">DETALHES DO LIVRO</h1>
        
        <div className="details-box">
          <div className="details-top">
            <div className="details-cover">📚</div>
            
            <div className="description">
              <p>{selectedBook.descricao}</p>
            </div>
          </div>

          <div className="info-fields">
            <div className="info-field">
              <label className="field-label">Título</label>
              <div className="field-value">{selectedBook.title}</div>
            </div>

            <div className="info-field">
              <label className="field-label">Autor</label>
              <div className="field-value">{selectedBook.author}</div>
            </div>

            <div className="info-field">
              <label className="field-label">Publicação</label>
              <div className="field-value">{selectedBook.publicacao}</div>
            </div>

            <div className="info-field">
              <label className="field-label">Categoria</label>
              <div className="field-value">{selectedBook.categoria}</div>
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={() => setCurrentPage('catalogo')}
              className="back-button"
            >
              Voltar
            </button>
            {selectedBook.disponivel ? (
              <button
                onClick={handleReservar}
                className="reserve-button"
              >
                Reservar
              </button>
            ) : (
              <button disabled className="disabled-button">
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
