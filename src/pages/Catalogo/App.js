import React, { useState } from 'react';
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
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [disponibilidadeFilter, setDisponibilidadeFilter] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('titulo-asc');

  // Extrair categorias únicas dos livros
  const categorias = ['todas', ...new Set(books.map(book => book.categoria))];

  // Filtrar livros
  let filteredBooks = books.filter(book => {
    // Filtro de pesquisa
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de categoria
    const matchesCategoria = categoriaFilter === 'todas' || book.categoria === categoriaFilter;
    
    // Filtro de disponibilidade
    const matchesDisponibilidade = disponibilidadeFilter === 'todas' || 
                                   (disponibilidadeFilter === 'disponiveis' && book.disponivel) ||
                                   (disponibilidadeFilter === 'indisponiveis' && !book.disponivel);
    
    return matchesSearch && matchesCategoria && matchesDisponibilidade;
  });

  // Ordenar livros
  filteredBooks = [...filteredBooks].sort((a, b) => {
    switch (ordenacao) {
      case 'titulo-asc':
        return a.title.localeCompare(b.title);
      case 'titulo-desc':
        return b.title.localeCompare(a.title);
      case 'ano-asc':
        return parseInt(a.publicacao) - parseInt(b.publicacao);
      case 'ano-desc':
        return parseInt(b.publicacao) - parseInt(a.publicacao);
      default:
        return 0;
    }
  });

  const limparFiltros = () => {
    setCategoriaFilter('todas');
    setDisponibilidadeFilter('todas');
    setOrdenacao('titulo-asc');
  };

  const hasActiveFilters = categoriaFilter !== 'todas' || 
                          disponibilidadeFilter !== 'todas' || 
                          ordenacao !== 'titulo-asc';

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

        {/* Filtros e Ordenação */}
        <div className="filters-container">
          <div className="filters-row">
            <select 
              className="filter-select"
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'todas' ? 'Todas as categorias' : cat}
                </option>
              ))}
            </select>

            <select 
              className="filter-select"
              value={disponibilidadeFilter}
              onChange={(e) => setDisponibilidadeFilter(e.target.value)}
            >
              <option value="todas">Todas disponibilidades</option>
              <option value="disponiveis">Apenas disponíveis</option>
              <option value="indisponiveis">Apenas indisponíveis</option>
            </select>

            <select 
              className="filter-select"
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
            >
              <option value="titulo-asc">Título (A-Z)</option>
              <option value="titulo-desc">Título (Z-A)</option>
              <option value="ano-asc">Mais antigos</option>
              <option value="ano-desc">Mais recentes</option>
            </select>

            {hasActiveFilters && (
              <button 
                className="clear-filters-btn"
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="results-count">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'livro encontrado' : 'livros encontrados'}
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
