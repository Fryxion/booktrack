// ==========================================
// PÁGINA DE RESERVAS - BOOKTRACK
// ==========================================
// Esta é a página onde o utilizador vê suas reservas ativas
// Funcionalidades:
// - 📋 Lista de todas as reservas do utilizador
// - 🏷️ Estados visuais (pendente, confirmada, cancelada, expirada)
// - ❌ Cancelamento de reservas ativas
// - 📅 Datas de reserva e expiração
// - 🔄 Recarregamento em caso de erro
//
// ESTADOS DE RESERVA:
// - pendente (amarelo): Aguardando processamento do bibliotecário
// - confirmada (verde): Livro está separado, pode levantar
// - cancelada (vermelho): Reserva foi cancelada
// - expirada (vermelho escuro): Passou da data limite

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/App';
import { reservasAPI } from '../../services/api';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - ReservasPage
// ==========================================
const ReservasPage = ({ setCurrentPage, showToast, onCancelarReserva }) => {
  // ------------------------------------------
  // ESTADO DO COMPONENTE
  // ------------------------------------------
  // reservasAtivas: Array com todas as reservas do utilizador
  // Cada reserva contém:
  //   - id_reserva, isbn, titulo, autor
  //   - data_reserva, data_expiracao
  //   - estado ('pendente', 'confirmada', 'cancelada', 'expirada')
  const [reservasAtivas, setReservasAtivas] = useState([]);
  
  // loading: Indica se está a carregar dados da API
  // true = mostra spinner, false = mostra dados ou erro
  const [loading, setLoading] = useState(true);
  
  // error: Mensagem de erro se falhar ao carregar reservas
  // null = sem erro, string = mensagem para mostrar
  const [error, setError] = useState(null);

  // ==========================================
  // EFEITO: Carregar reservas ao montar
  // ==========================================
  // O QUÊ: Carrega lista de reservas quando a página é aberta
  // PORQUÊ: Utilizador precisa ver suas reservas imediatamente
  // QUANDO: Só executa uma vez ([] vazio = apenas no mount)
  useEffect(() => {
    loadReservas();
  }, []);

  // ==========================================
  // FUNÇÃO: loadReservas
  // ==========================================
  // O QUÊ: Busca todas as reservas do utilizador autenticado
  // PORQUÊ: Mostrar estado atual das reservas (pendentes, confirmadas, etc)
  // COMO:
  //   1. Ativa loading (mostra spinner)
  //   2. Limpa erros anteriores
  //   3. Chama API reservasAPI.getMinhas()
  //   4. Se sucesso: guarda array de reservas no estado
  //   5. Se erro: guarda mensagem para mostrar
  //   6. Sempre desativa loading no final
  //
  // ENDPOINT: GET /api/reservas/minhas
  // AUTENTICAÇÃO: Usa token do localStorage
  // RETORNA: Array de reservas com dados do livro
  const loadReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Chama endpoint que retorna reservas do utilizador autenticado
      const response = await reservasAPI.getMinhas();
      
      if (response.success) {
        // Sucesso: guarda array de reservas
        setReservasAtivas(response.data);
      } else {
        // Erro da API: mostra mensagem
        setError(response.message || 'Erro ao carregar reservas');
      }
    } catch (err) {
      // Erro de rede: servidor offline ou sem conexão
      console.error('Erro ao carregar reservas:', err);
      setError('Erro ao conectar ao servidor');
    } finally {
      // Sempre desativa loading (sucesso ou erro)
      setLoading(false);
    }
  };

  // ==========================================
  // FUNÇÃO: handleCancelarReserva
  // ==========================================
  // O QUÊ: Cancela uma reserva específica
  // PORQUÊ: Utilizador pode desistir de uma reserva
  // COMO:
  //   1. Pede confirmação com window.confirm()
  //   2. Se confirmar: chama API reservasAPI.cancelar(id)
  //   3. Se sucesso: remove da lista local + mostra toast verde
  //   4. Se erro: mostra toast vermelho com mensagem
  //
  // PARÂMETROS:
  //   - id: ID da reserva a cancelar
  //   - titulo: Título do livro (para mostrar na confirmação)
  //
  // NOTA: Só funciona para reservas com estado 'pendente' ou 'confirmada'
  const handleCancelarReserva = async (id, titulo) => {
    // Confirmar com o utilizador antes de cancelar
    if (window.confirm(`Tem certeza que deseja cancelar a reserva do livro "${titulo}"?`)) {
      try {
        // Chama endpoint para cancelar reserva
        const response = await reservasAPI.cancelar(id);
        
        if (response.success) {
          // Sucesso: mostra mensagem verde
          showToast('Reserva cancelada com sucesso!', 'success');
          
          // Remove da lista local (atualização otimista da UI)
          // filter() mantém todas as reservas EXCETO a que tem o ID cancelado
          setReservasAtivas(reservasAtivas.filter(r => r.id_reserva !== id));
        } else {
          // Erro da API: mostra mensagem vermelha
          showToast(response.message || 'Erro ao cancelar reserva', 'error');
        }
      } catch (err) {
        // Erro de rede ou outro erro inesperado
        console.error('Erro ao cancelar reserva:', err);
        const message = err.response?.data?.message || 'Erro ao cancelar reserva';
        showToast(message, 'error');
      }
    }
  };

  // ==========================================
  // FUNÇÃO AUXILIAR: formatDate
  // ==========================================
  // O QUÊ: Converte string de data ISO para formato português
  // ENTRADA: "2024-12-10T10:30:00.000Z" (ISO 8601)
  // SAÍDA: "10/12/2024" (dd/mm/yyyy)
  // NOTA: Se dateString for null/undefined, retorna 'N/A'
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
  };

  // ==========================================
  // FUNÇÃO AUXILIAR: getEstadoBadge
  // ==========================================
  // O QUÊ: Retorna badge colorido conforme estado da reserva
  // PORQUÊ: Feedback visual rápido do estado
  // ESTADOS:
  //   - pendente (amarelo): #fef3c7 + #92400e
  //   - confirmada (verde): badge-available (classe CSS)
  //   - cancelada (vermelho): badge-unavailable (classe CSS)
  //   - expirada (vermelho escuro): #fee2e2 + #7f1d1d
  const getEstadoBadge = (estado) => {
    switch(estado) {
      case 'pendente':
        return <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Pendente</span>;
      case 'confirmada':
        return <span className="badge badge-available">Confirmada</span>;
      case 'cancelada':
        return <span className="badge badge-unavailable">Cancelada</span>;
      case 'expirada':
        return <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#7f1d1d' }}>Expirada</span>;
      default:
        return <span className="badge">{estado}</span>;
    }
  };

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <div className="catalog-container">
      {/* Cabeçalho (destaca "perfil" porque reservas é subpágina do perfil) */}
      <Header activePage="perfil" setCurrentPage={setCurrentPage} />
      
      <main className="catalog-main" role="main">
        {/* Título da página */}
        <h1 className="catalog-title">MINHAS RESERVAS</h1>
        
        {/* Caixa principal */}
        <div className="details-box">
          {/* ------------------------------------------
              ESTADO 1: Loading - A carregar dados
              ------------------------------------------ */}
          {loading ? (
            <div className="empty-state">
              <div className="spinner"></div>
              <p>A carregar reservas...</p>
            </div>
          
          /* ------------------------------------------
             ESTADO 2: Erro - Falha ao carregar
             ------------------------------------------ */
          ) : error ? (
            <div className="empty-state">
              {/* Mensagem de erro em vermelho */}
              <p style={{ color: '#ef4444' }}>{error}</p>
              {/* Botão para tentar carregar novamente */}
              <button className="secondary-button" onClick={loadReservas}>
                Tentar novamente
              </button>
            </div>
          
          /* ------------------------------------------
             ESTADO 3: Vazio - Sem reservas
             ------------------------------------------ */
          ) : reservasAtivas.length === 0 ? (
            <div className="empty-state">
              <p>Não tem reservas ativas.</p>
              {/* Botão para ir ao catálogo e fazer reservas */}
              <button 
                className="primary-button" 
                onClick={() => setCurrentPage('catalogo')}
                style={{ marginTop: '1rem' }}
              >
                Explorar Catálogo
              </button>
            </div>
          
          /* ------------------------------------------
             ESTADO 4: Lista - Mostra todas as reservas
             ------------------------------------------ */
          ) : (
            reservasAtivas.map((reserva) => (
              <div key={reserva.id_reserva} className="reserva-card">
                {/* Ícone do livro */}
                <div className="small-cover">📚</div>
                
                {/* Informações da reserva */}
                <div className="reserva-info">
                  {/* Título do livro */}
                  <h4 className="reserva-title">
                    {reserva.titulo || 'Título não disponível'}
                  </h4>
                  
                  {/* Autor */}
                  <p className="book-detail">Autor: {reserva.autor || 'N/A'}</p>
                  
                  {/* ISBN (código único do livro) */}
                  <p className="book-detail">ISBN: {reserva.isbn}</p>
                  
                  {/* Data em que fez a reserva */}
                  <p className="book-detail">Data de Reserva: {formatDate(reserva.data_reserva)}</p>
                  
                  {/* Data limite para levantar o livro */}
                  <p className="book-detail">Data de Expiração: {formatDate(reserva.data_expiracao)}</p>
                  
                  {/* Badge colorido com estado (pendente/confirmada/cancelada/expirada) */}
                  <div style={{ marginTop: '0.5rem' }}>
                    {getEstadoBadge(reserva.estado)}
                  </div>
                </div>
                
                {/* ------------------------------------------
                    BOTÃO DE CANCELAR
                    ------------------------------------------
                    Só aparece se estado for 'pendente' ou 'confirmada'
                    Reservas canceladas ou expiradas não podem ser canceladas
                */}
                {(reserva.estado === 'pendente' || reserva.estado === 'confirmada') && (
                  <button 
                    onClick={() => handleCancelarReserva(reserva.id_reserva, reserva.titulo)}
                    className="cancel-button"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            ))
          )}
          
          {/* ------------------------------------------
              BOTÃO VOLTAR AO PERFIL
              ------------------------------------------
              Sempre presente na parte inferior
          */}
          <div className="back-section">
            <button 
              onClick={() => setCurrentPage('perfil')}
              className="back-button"
            >
              Voltar ao Perfil
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReservasPage;
