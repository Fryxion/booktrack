import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header/App';
import { livrosAPI } from '../../services/api';
import '../../styles/App.css';

const CatalogoPage = ({ handleBookClick, setCurrentPage }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [disponibilidadeFilter, setDisponibilidadeFilter] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('titulo-asc');
  const [categorias, setCategorias] = useState(['todas']);

  const searchInputRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // Carregar livros ao montar o componente
  useEffect(() => {
    loadBooks();
    loadCategorias();
  }, []);

  // Carregar livros da API
  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await livrosAPI.getAll();
      
      if (response.success) {
        setBooks(response.data);
      } else {
        setError(response.message || 'Erro ao carregar livros');
      }
    } catch (err) {
      console.error('Erro ao carregar livros:', err);
      setError('Erro ao conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  // Carregar categorias da API
  const loadCategorias = async () => {
    try {
      const response = await livrosAPI.getCategorias();
      if (response.success && response.data) {
        setCategorias(['todas', ...response.data]);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  // Aplicar filtros e pesquisa
  let filteredBooks = books.filter(book => {
    // Filtro de pesquisa (título, autor ou ISBN)
    const matchesSearch = book.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.autor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de categoria
    const matchesCategoria = categoriaFilter === 'todas' || book.categoria === categoriaFilter;
    
    // Filtro de disponibilidade
    const matchesDisponibilidade = disponibilidadeFilter === 'todas' || 
                                   (disponibilidadeFilter === 'disponiveis' && book.copias_disponiveis > 0) ||
                                   (disponibilidadeFilter === 'indisponiveis' && book.copias_disponiveis === 0);
    
    return matchesSearch && matchesCategoria && matchesDisponibilidade;
  });

  // Ordenar livros
  filteredBooks = [...filteredBooks].sort((a, b) => {
    switch (ordenacao) {
      case 'titulo-asc':
        return a.titulo.localeCompare(b.titulo);
      case 'titulo-desc':
        return b.titulo.localeCompare(a.titulo);
      case 'ano-asc':
        return new Date(a.data_publicacao) - new Date(b.data_publicacao);
      case 'ano-desc':
        return new Date(b.data_publicacao) - new Date(a.data_publicacao);
      default:
        return 0;
    }
  });

  const limparFiltros = () => {
    setCategoriaFilter('todas');
    setDisponibilidadeFilter('todas');
    setOrdenacao('titulo-asc');
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  const hasActiveFilters = categoriaFilter !== 'todas' || 
                          disponibilidadeFilter !== 'todas' || 
                          ordenacao !== 'titulo-asc' ||
                          searchQuery !== '';

  // Loading state
  if (loading) {
    return (
      <div className="catalog-container">
        <Header activePage="catalogo" setCurrentPage={setCurrentPage} />
        <main className="catalog-main" role="main">
          <h1 className="catalog-title">CATÁLOGO</h1>
          <div className="empty-state">
            <div className="spinner"></div>
            <p>A carregar livros...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="catalog-container">
        <Header activePage="catalogo" setCurrentPage={setCurrentPage} />
        <main className="catalog-main" role="main">
          <h1 className="catalog-title">CATÁLOGO</h1>
          <div className="empty-state">
            <p style={{ color: '#ef4444' }}>{error}</p>
            <button className="primary-button" onClick={loadBooks}>
              Tentar novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

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
              key={book.id_livro}
              onClick={() => handleBookClick(book)}
              className="book-card"
            >
              <div className="book-cover">📚</div>
              
              <div className="book-info">
                <h3 className="book-title">{book.titulo}</h3>
                <p className="book-detail">Autor: {book.autor}</p>
                <p className="book-detail">ISBN: {book.isbn}</p>
                <p className="book-detail">Categoria: {book.categoria}</p>
                <p className="book-detail">
                  Disponíveis: {book.copias_disponiveis} de {book.total_copias}
                </p>
                <div>
                  {book.copias_disponiveis > 0 ? (
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
            {hasActiveFilters && (
              <button className="secondary-button" onClick={limparFiltros}>
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CatalogoPage;
