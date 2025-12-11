import React from 'react';
import Header from '../../components/Header/App';
import '../../styles/App.css';

const CatalogoPage = ({ 
  books, 
  searchQuery, 
  setSearchQuery,
  searchInputRef, 
  searchDebounceRef, 
  handleBookClick, 
  setCurrentPage 
}) => {
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="catalog-container">
      <Header activePage="catalogo" setCurrentPage={setCurrentPage} />
      
      <main className="catalog-main" role="main">
        <h1 className="catalog-title">CATÁLOGO</h1>
        
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              defaultValue={searchQuery}
              onInput={(e) => {
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                const val = e.target.value;
                searchDebounceRef.current = setTimeout(() => {
                  setSearchQuery(val);
                }, 250);
              }}
              placeholder="Pesquisar por título ou autor..."
              className="search-input"
            />
          </div>
        </div>

        <div className="books-list">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleBookClick(book)}
              className="book-card"
            >
              <div className="book-cover">📚</div>
              
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-detail">Autor: {book.author}</p>
                <p className="book-detail">Publicação: {book.publicacao}</p>
                <p className="book-detail">Categoria: {book.categoria}</p>
                <div>
                  {book.disponivel ? (
                    <span className="badge badge-available">
                      Disponível
                    </span>
                  ) : (
                    <span className="badge badge-unavailable">
                      Indisponível
                    </span>
                  )}
                </div>
              </div>
              
              <span className="arrow-icon">›</span>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="empty-state">
            <p>Nenhum livro encontrado.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CatalogoPage;
