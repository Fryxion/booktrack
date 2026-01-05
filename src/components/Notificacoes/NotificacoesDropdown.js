import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import './NotificacoesDropdown.css';

/**
 * Componente de Notificações (Sino com Dropdown)
 * Versão adaptada ao estilo do BookTrack
 */
const NotificacoesDropdown = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carregar notificações não lidas (polling a cada 30s)
  useEffect(() => {
    fetchNaoLidas();
    
    const interval = setInterval(() => {
      fetchNaoLidas();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch notificações não lidas (apenas contagem)
  const fetchNaoLidas = async () => {
    try {
      const response = await api.get('/notificacoes/nao-lidas');
      setNaoLidas(response.data.count);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Fetch todas as notificações (quando abre dropdown)
  const fetchTodasNotificacoes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notificacoes');
      setNotificacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isOpen) {
      fetchTodasNotificacoes();
    }
    setIsOpen(!isOpen);
  };

  // Marcar como lida
  const marcarComoLida = async (id) => {
    try {
      await api.patch(`/notificacoes/${id}/marcar-lida`);
      setNotificacoes(notificacoes.map(n => 
        n.id_notificacao === id ? { ...n, lida: 1 } : n
      ));
      setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  // Marcar todas como lidas
  const marcarTodasLidas = async () => {
    try {
      await api.patch('/notificacoes/marcar-todas-lidas');
      setNotificacoes(notificacoes.map(n => ({ ...n, lida: 1 })));
      setNaoLidas(0);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Eliminar notificação
  const eliminarNotificacao = async (id) => {
    try {
      await api.delete(`/notificacoes/${id}`);
      const notificacao = notificacoes.find(n => n.id_notificacao === id);
      setNotificacoes(notificacoes.filter(n => n.id_notificacao !== id));
      
      if (!notificacao.lida) {
        setNaoLidas(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Obter ícone baseado no tipo
  const getIcone = (tipo) => {
    const icones = {
      emprestimo: '📚',
      reserva: '🔖',
      disponivel: '🎉',
      lembrete: '⏰',
      atraso: '⚠️',
      renovacao: '🔄',
      cancelamento: '❌',
      info: 'ℹ️'
    };
    return icones[tipo] || 'ℹ️';
  };

  // Formatar data relativa
  const formatarDataRelativa = (dataEnvio) => {
    const agora = new Date();
    const data = new Date(dataEnvio);
    const diffMs = agora - data;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMins / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHoras < 24) return `Há ${diffHoras}h`;
    if (diffDias < 7) return `Há ${diffDias}d`;
    return data.toLocaleDateString('pt-PT');
  };

  return (
    <div className="notificacoes-container" ref={dropdownRef}>
      {/* Botão do Sino */}
      <button
        onClick={toggleDropdown}
        className="notificacoes-button"
        aria-label="Notificações"
      >
        🔔
        {naoLidas > 0 && (
          <span className="notificacoes-badge">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="notificacoes-dropdown">
          {/* Header */}
          <div className="notificacoes-header">
            <h3>Notificações</h3>
            {naoLidas > 0 && (
              <button onClick={marcarTodasLidas} className="marcar-todas-btn">
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="notificacoes-lista">
            {loading ? (
              <div className="notificacoes-loading">
                <div className="spinner"></div>
                <p>A carregar...</p>
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="notificacoes-vazio">
                <span style={{ fontSize: '3rem' }}>📭</span>
                <p>Nenhuma notificação</p>
                <small>Estás em dia!</small>
              </div>
            ) : (
              <ul>
                {notificacoes.map((notificacao) => (
                  <li
                    key={notificacao.id_notificacao}
                    className={`notificacao-item ${!notificacao.lida ? 'nao-lida' : ''}`}
                  >
                    <span className="notificacao-icone">
                      {getIcone(notificacao.tipo)}
                    </span>
                    <div className="notificacao-conteudo">
                      <p className={!notificacao.lida ? 'negrito' : ''}>
                        {notificacao.mensagem}
                      </p>
                      <small>{formatarDataRelativa(notificacao.data_envio)}</small>
                    </div>
                    <div className="notificacao-acoes">
                      {!notificacao.lida && (
                        <button
                          onClick={() => marcarComoLida(notificacao.id_notificacao)}
                          className="btn-acao"
                          title="Marcar como lida"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => eliminarNotificacao(notificacao.id_notificacao)}
                        className="btn-acao btn-eliminar"
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notificacoes.length > 0 && (
            <div className="notificacoes-footer">
              <button onClick={() => setIsOpen(false)} className="ver-todas-btn">
                Fechar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificacoesDropdown;