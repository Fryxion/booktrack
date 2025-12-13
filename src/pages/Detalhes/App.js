// ==========================================
// PÁGINA DE DETALHES DO LIVRO - BOOKTRACK
// ==========================================
// Esta página mostra informação completa sobre um livro específico
// Os utilizadores podem:
// - 📖 Ver todos os detalhes do livro (título, autor, ISBN, categoria, data publicação)
// - 📝 Ler a descrição completa do livro
// - ✅ Ver disponibilidade (quantas cópias disponíveis)
// - 📌 Reservar o livro (se disponível)
// - ⬅️ Voltar ao catálogo
//
// NOTA: Esta página é acedida ao clicar num livro no catálogo

import React, { useState } from 'react';
import Header from '../../components/Header/App';
import { reservasAPI } from '../../services/api';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - DetalhesPage
// ==========================================
const DetalhesPage = ({ selectedBook, setCurrentPage, showToast }) => {
  // ------------------------------------------
  // ESTADO: CONTROLO DA RESERVA
  // ------------------------------------------
  // true = pedido de reserva em curso, mostra spinner no botão
  const [isReserving, setIsReserving] = useState(false);

  // ------------------------------------------
  // VALIDAÇÃO: LIVRO SELECIONADO
  // ------------------------------------------
  // Se não há livro selecionado, não renderiza nada
  // (previne erro se utilizador aceder à página diretamente)
  if (!selectedBook) return null;

  // ------------------------------------------
  // FUNÇÃO: RESERVAR LIVRO
  // ------------------------------------------
  // Cria uma reserva para o utilizador autenticado
  // 
  // FLUXO:
  // 1. Ativa estado de loading (botão mostra "A reservar...")
  // 2. Faz pedido POST /reservas com id_livro
  // 3. Se sucesso: Mostra toast verde e volta ao catálogo
  // 4. Se erro: Mostra toast vermelho com mensagem de erro
  // 5. Desativa loading
  // 
  // REGRAS DE NEGÓCIO (validadas no backend):
  // - Utilizador não pode ter mais de 3 reservas ativas
  // - Não pode reservar livro que já tem emprestado
  // - Não pode ter reserva duplicada do mesmo livro
  // - Livro tem de ter pelo menos 1 cópia (mesmo que indisponível no momento)
  const handleReservar = async () => {
    try {
      setIsReserving(true); // Mostrar spinner no botão
      
      // Fazer pedido ao servidor para criar reserva
      const response = await reservasAPI.create(selectedBook.id_livro);
      
      if (response.success) {
        // Reserva criada com sucesso!
        showToast('Reserva efetuada com sucesso! Receberá uma notificação quando o livro estiver disponível.', 'success');
        // Aguardar 1.5 segundos para utilizador ler mensagem, depois voltar ao catálogo
        setTimeout(() => {
          setCurrentPage('catalogo');
        }, 1500);
      } else {
        // Servidor retornou erro (ex: "Já tem 3 reservas ativas")
        showToast(response.message || 'Erro ao efetuar reserva', 'error');
      }
    } catch (error) {
      // Erro de rede ou servidor offline
      console.error('Erro ao reservar:', error);
      const message = error.response?.data?.message || 'Erro ao efetuar reserva';
      showToast(message, 'error');
    } finally {
      // Finally executa SEMPRE (sucesso ou erro)
      setIsReserving(false); // Esconder spinner
    }
  };

  // ------------------------------------------
  // FUNÇÃO AUXILIAR: FORMATAR DATA
  // ------------------------------------------
  // Converte data ISO (2024-12-12T00:00:00.000Z) para formato português (12/12/2024)
  // Se não houver data, retorna 'N/A'
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT'); // pt-PT = formato português
  };

  // ------------------------------------------
  // VERIFICAR DISPONIBILIDADE
  // ------------------------------------------
  // Livro está disponível se tiver pelo menos 1 cópia disponível
  const disponivel = selectedBook.copias_disponiveis > 0;

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <div className="details-container">
      {/* Cabeçalho com navegação (destaca "catalogo" no menu) */}
      <Header activePage="catalogo" setCurrentPage={setCurrentPage} />
      
      <main className="details-main" role="main">
        <h1 className="catalog-title">DETALHES DO LIVRO</h1>
        
        {/* ------------------------------------------
            CAIXA DE DETALHES
            ------------------------------------------
            Contém toda a informação do livro dividida em secções
        */}
        <div className="details-box">
          {/* ------------------------------------------
              SECÇÃO SUPERIOR: CAPA + DESCRIÇÃO
              ------------------------------------------
          */}
          <div className="details-top">
            {/* Ícone de livro (placeholder para capa) */}
            <div className="details-cover">📚</div>
            
            {/* Descrição/sinopse do livro */}
            <div className="description">
              <p>{selectedBook.descricao || 'Sem descrição disponível.'}</p>
            </div>
          </div>

          {/* ------------------------------------------
              CAMPOS DE INFORMAÇÃO
              ------------------------------------------
              Lista de todos os detalhes do livro em formato label + value
          */}
          <div className="info-fields">
            {/* CAMPO: TÍTULO */}
            <div className="info-field">
              <label className="field-label">Título</label>
              <div className="field-value">{selectedBook.titulo}</div>
            </div>

            {/* CAMPO: AUTOR */}
            <div className="info-field">
              <label className="field-label">Autor</label>
              <div className="field-value">{selectedBook.autor}</div>
            </div>

            {/* CAMPO: ISBN (código internacional do livro) */}
            <div className="info-field">
              <label className="field-label">ISBN</label>
              <div className="field-value">{selectedBook.isbn}</div>
            </div>

            {/* CAMPO: CATEGORIA */}
            <div className="info-field">
              <label className="field-label">Categoria</label>
              <div className="field-value">{selectedBook.categoria}</div>
            </div>

            {/* CAMPO: DATA DE PUBLICAÇÃO */}
            <div className="info-field">
              <label className="field-label">Data de Publicação</label>
              <div className="field-value">{formatDate(selectedBook.data_publicacao)}</div>
            </div>

            {/* ------------------------------------------
                CAMPO: DISPONIBILIDADE
                ------------------------------------------
                Mostra badge verde (disponível) ou vermelho (indisponível)
                + número de cópias disponíveis vs total
            */}
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

          {/* ------------------------------------------
              BOTÕES DE AÇÃO
              ------------------------------------------
              Botão "Voltar" (sempre visível) +
              Botão "Reservar" (só se disponível) ou "Indisponível" (desativado)
          */}
          <div className="button-group">
            {/* Botão VOLTAR: Volta ao catálogo */}
            <button
              onClick={() => setCurrentPage('catalogo')}
              className="back-button"
            >
              Voltar
            </button>
            
            {/* LÓGICA CONDICIONAL DO BOTÃO PRINCIPAL */}
            {disponivel ? (
              // ------------------------------------------
              // LIVRO DISPONÍVEL: Botão "Reservar"
              // ------------------------------------------
              <button
                onClick={handleReservar}
                className="reserve-button"
                disabled={isReserving} // Desativa enquanto processa
              >
                {isReserving ? (
                  // Estado de loading: mostra spinner + texto "A reservar..."
                  <span className="button-loading">
                    <span className="spinner"></span>
                    A reservar...
                  </span>
                ) : (
                  // Estado normal: mostra "Reservar"
                  'Reservar'
                )}
              </button>
            ) : (
              // ------------------------------------------
              // LIVRO INDISPONÍVEL: Botão desativado
              // ------------------------------------------
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
