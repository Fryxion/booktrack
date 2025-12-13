// ==========================================
// PÁGINA DE CATÁLOGO - BOOKTRACK
// ==========================================
// Esta página mostra todos os livros disponíveis na biblioteca
// Os utilizadores podem:
// - 🔍 Pesquisar livros por título, autor ou ISBN
// - 🏷️ Filtrar por categoria (ficção, técnico, etc.)
// - ✅ Filtrar por disponibilidade (disponíveis/indisponíveis)
// - 📊 Ordenar por título ou data de publicação
// - 👆 Clicar num livro para ver detalhes completos

import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header/App';
import { livrosAPI } from '../../services/api';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - CatalogoPage
// ==========================================
const CatalogoPage = ({ handleBookClick, setCurrentPage }) => {
  // ------------------------------------------
  // ESTADO: DADOS DOS LIVROS
  // ------------------------------------------
  const [books, setBooks] = useState([]); // Array com todos os livros da biblioteca
  const [loading, setLoading] = useState(true); // true = a carregar dados do servidor
  const [error, setError] = useState(null); // Mensagem de erro, se houver
  
  // ------------------------------------------
  // ESTADO: FILTROS E PESQUISA
  // ------------------------------------------
  const [searchQuery, setSearchQuery] = useState(''); // Texto de pesquisa (título/autor/ISBN)
  const [categoriaFilter, setCategoriaFilter] = useState('todas'); // Filtro de categoria selecionado
  const [disponibilidadeFilter, setDisponibilidadeFilter] = useState('todas'); // Filtro de disponibilidade
  const [ordenacao, setOrdenacao] = useState('titulo-asc'); // Como ordenar: titulo-asc, titulo-desc, ano-asc, ano-desc
  const [categorias, setCategorias] = useState(['todas']); // Lista de categorias disponíveis
  
  // ------------------------------------------
  // REFERÊNCIAS (Refs)
  // ------------------------------------------
  // useRef permite guardar valores que NÃO causam re-render quando mudam
  const searchInputRef = useRef(null); // Referência ao campo de pesquisa (para limpar valor)
  const searchDebounceRef = useRef(null); // Timer para debounce (esperar utilizador parar de escrever)
  
  // ------------------------------------------
  // EFEITO: CARREGAR DADOS AO INICIAR
  // ------------------------------------------
  // Executa apenas 1 vez quando a página é aberta ([] = sem dependências)
  useEffect(() => {
    loadBooks(); // Buscar lista de livros
    loadCategorias(); // Buscar lista de categorias
  }, []);

  // ------------------------------------------
  // FUNÇÃO: CARREGAR LIVROS DO SERVIDOR
  // ------------------------------------------
  // Faz pedido à API para buscar todos os livros do catálogo
  // 
  // FLUXO:
  // 1. Ativa loading (mostra spinner)
  // 2. Limpa erro anterior
  // 3. Faz pedido GET /livros
  // 4. Se sucesso: guarda livros no estado
  // 5. Se erro: guarda mensagem de erro
  // 6. Desativa loading
  const loadBooks = async () => {
    try {
      setLoading(true); // Mostrar spinner "A carregar..."
      setError(null); // Limpar erro anterior
      
      // Chamar API para buscar livros
      const response = await livrosAPI.getAll();
      
      // Verificar se pedido foi bem-sucedido
      if (response.success) {
        setBooks(response.data); // Guardar array de livros
      } else {
        // Algo correu mal no servidor
        setError(response.message || 'Erro ao carregar livros');
      }
    } catch (err) {
      // Erro de rede ou servidor offline
      console.error('Erro ao carregar livros:', err);
      setError('Erro ao conectar ao servidor');
    } finally {
      // Finally executa SEMPRE (sucesso ou erro)
      setLoading(false); // Esconder spinner
    }
  };

  // ------------------------------------------
  // FUNÇÃO: CARREGAR CATEGORIAS
  // ------------------------------------------
  // Busca lista de todas as categorias únicas de livros
  // Usado para popular o dropdown de filtro de categoria
  // 
  // Exemplo de categorias: ["Ficção", "Técnico", "Infantil", "Romance"]
  const loadCategorias = async () => {
    try {
      const response = await livrosAPI.getCategorias();
      if (response.success && response.data) {
        // Adicionar 'todas' no início para opção "Todas as categorias"
        setCategorias(['todas', ...response.data]);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      // Não bloqueia a página se falhar, apenas não mostra categorias
    }
  };

  // ==========================================
  // LÓGICA DE FILTRAGEM E ORDENAÇÃO
  // ==========================================
  
  // ------------------------------------------
  // APLICAR FILTROS
  // ------------------------------------------
  // Esta secção filtra o array de livros baseado nos critérios selecionados:
  // 1. Pesquisa por texto (título, autor ou ISBN)
  // 2. Categoria específica
  // 3. Disponibilidade (disponíveis/indisponíveis)
  let filteredBooks = books.filter(book => {
    // ------------------------------------------
    // FILTRO 1: PESQUISA DE TEXTO
    // ------------------------------------------
    // Verifica se o texto de pesquisa aparece em:
    // - Título do livro
    // - Nome do autor
    // - Código ISBN
    // toLowerCase() = ignora maiúsculas/minúsculas
    const matchesSearch = book.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.autor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    
    // ------------------------------------------
    // FILTRO 2: CATEGORIA
    // ------------------------------------------
    // Se 'todas' está selecionado = mostra todas categorias
    // Senão = só mostra livros da categoria selecionada
    const matchesCategoria = categoriaFilter === 'todas' || book.categoria === categoriaFilter;
    
    // ------------------------------------------
    // FILTRO 3: DISPONIBILIDADE
    // ------------------------------------------
    // 'todas' = mostra todos
    // 'disponiveis' = só livros com copias_disponiveis > 0
    // 'indisponiveis' = só livros com copias_disponiveis = 0
    const matchesDisponibilidade = disponibilidadeFilter === 'todas' || 
                                   (disponibilidadeFilter === 'disponiveis' && book.copias_disponiveis > 0) ||
                                   (disponibilidadeFilter === 'indisponiveis' && book.copias_disponiveis === 0);
    
    // Livro só aparece se passar em TODOS os filtros (AND lógico)
    return matchesSearch && matchesCategoria && matchesDisponibilidade;
  });

  // ------------------------------------------
  // ORDENAR LIVROS
  // ------------------------------------------
  // Ordena o array filtrado de acordo com a opção selecionada
  // localeCompare = compara strings respeitando acentos e ç
  filteredBooks = [...filteredBooks].sort((a, b) => {
    switch (ordenacao) {
      case 'titulo-asc':
        // A → Z (alfabética crescente)
        return a.titulo.localeCompare(b.titulo);
      case 'titulo-desc':
        // Z → A (alfabética decrescente)
        return b.titulo.localeCompare(a.titulo);
      case 'ano-asc':
        // Mais antigos primeiro (1950 → 2024)
        return new Date(a.data_publicacao) - new Date(b.data_publicacao);
      case 'ano-desc':
        // Mais recentes primeiro (2024 → 1950)
        return new Date(b.data_publicacao) - new Date(a.data_publicacao);
      default:
        return 0; // Sem ordenação
    }
  });

  // ------------------------------------------
  // FUNÇÃO: LIMPAR TODOS OS FILTROS
  // ------------------------------------------
  // Reseta todos os filtros para valores padrão
  // Usado quando utilizador clica em "Limpar filtros"
  const limparFiltros = () => {
    setCategoriaFilter('todas');
    setDisponibilidadeFilter('todas');
    setOrdenacao('titulo-asc');
    setSearchQuery('');
    // Limpar também o valor visual do input de pesquisa
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  // ------------------------------------------
  // VERIFICAR SE HÁ FILTROS ATIVOS
  // ------------------------------------------
  // Retorna true se qualquer filtro está diferente do padrão
  // Usado para mostrar/esconder botão "Limpar filtros"
  const hasActiveFilters = categoriaFilter !== 'todas' || 
                          disponibilidadeFilter !== 'todas' || 
                          ordenacao !== 'titulo-asc' ||
                          searchQuery !== '';

  // ==========================================
  // RENDERIZAÇÃO CONDICIONAL - LOADING
  // ==========================================
  // Se ainda está a carregar dados, mostrar spinner
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

  // ==========================================
  // RENDERIZAÇÃO CONDICIONAL - ERRO
  // ==========================================
  // Se houve erro ao carregar, mostrar mensagem e botão para tentar novamente
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

  // ==========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ==========================================
  return (
    <div className="catalog-container">
      {/* Cabeçalho com navegação */}
      <Header activePage="catalogo" setCurrentPage={setCurrentPage} />
      
      <main className="catalog-main" role="main">
        <h1 className="catalog-title">CATÁLOGO</h1>
        
        {/* ------------------------------------------
            BARRA DE PESQUISA
            ------------------------------------------
            Campo de texto com ícone de lupa
            Usa DEBOUNCE para só pesquisar 250ms após utilizador parar de escrever
            Isto evita fazer pesquisa a cada letra digitada (melhora performance)
        */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              defaultValue={searchQuery}
              onInput={(e) => {
                // ------------------------------------------
                // DEBOUNCE: ESPERAR UTILIZADOR PARAR DE ESCREVER
                // ------------------------------------------
                // Cancela timer anterior (se existir)
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                const val = e.target.value;
                // Cria novo timer: só atualiza pesquisa após 250ms sem escrever
                searchDebounceRef.current = setTimeout(() => {
                  setSearchQuery(val);
                }, 250);
              }}
              placeholder="Pesquisar por título ou autor..."
              className="search-input"
            />
          </div>
        </div>

        {/* ------------------------------------------
            ÁREA DE FILTROS
            ------------------------------------------
            3 dropdowns para filtrar/ordenar livros +
            botão "Limpar filtros" (só aparece se houver filtros ativos)
        */}
        <div className="filters-container">
          <div className="filters-row">
            {/* FILTRO 1: CATEGORIA */}
            <select 
              className="filter-select"
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
            >
              {/* Percorrer array de categorias e criar opção para cada */}
              {categorias.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'todas' ? 'Todas as categorias' : cat}
                </option>
              ))}
            </select>

            {/* FILTRO 2: DISPONIBILIDADE */}
            <select 
              className="filter-select"
              value={disponibilidadeFilter}
              onChange={(e) => setDisponibilidadeFilter(e.target.value)}
            >
              <option value="todas">Todas disponibilidades</option>
              <option value="disponiveis">Apenas disponíveis</option>
              <option value="indisponiveis">Apenas indisponíveis</option>
            </select>

            {/* FILTRO 3: ORDENAÇÃO */}
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

            {/* BOTÃO LIMPAR FILTROS: Só aparece se houver filtros ativos */}
            {hasActiveFilters && (
              <button 
                className="clear-filters-btn"
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* ------------------------------------------
              CONTADOR DE RESULTADOS
              ------------------------------------------
              Mostra quantos livros correspondem aos filtros
              Ex: "15 livros encontrados" ou "1 livro encontrado"
          */}
          <div className="results-count">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'livro encontrado' : 'livros encontrados'}
          </div>
        </div>

        {/* ------------------------------------------
            LISTA DE LIVROS (GRID)
            ------------------------------------------
            Cards clicáveis com informação de cada livro
            Ao clicar, chama handleBookClick() que vai para página de detalhes
        */}
        <div className="books-list">
          {filteredBooks.map((book) => (
            <div
              key={book.id_livro}
              onClick={() => handleBookClick(book)}
              className="book-card"
            >
              {/* Ícone de livro (placeholder) */}
              <div className="book-cover">📚</div>
              
              {/* Informações do livro */}
              <div className="book-info">
                <h3 className="book-title">{book.titulo}</h3>
                <p className="book-detail">Autor: {book.autor}</p>
                <p className="book-detail">ISBN: {book.isbn}</p>
                <p className="book-detail">Categoria: {book.categoria}</p>
                <p className="book-detail">
                  Disponíveis: {book.copias_disponiveis} de {book.total_copias}
                </p>
                <div>
                  {/* Badge de disponibilidade (verde ou vermelho) */}
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
              
              {/* Seta indicando que é clicável */}
              <span className="arrow-icon">›</span>
            </div>
          ))}
        </div>

        {/* ------------------------------------------
            ESTADO VAZIO
            ------------------------------------------
            Aparece quando não há livros que correspondem aos filtros
            Mostra mensagem e botão para limpar filtros
        */}
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
