// ==========================================
// COMPONENTE: Toast
// ==========================================
// Notificação temporária (toast) que aparece e desaparece
//
// FUNCIONALIDADES:
// - ⏱️ Auto-fecha após duração específica (padrão: 3 segundos)
// - 🎨 3 tipos: success (verde ✓), error (vermelho ✕), info (azul ℹ)
// - ❌ Botão manual de fechar (×)
// - ✨ Animação suave de entrada/saída
// - 📱 Posição fixa no topo direito
//
// PROPS:
// - message: String - texto da notificação
// - type: 'success' | 'error' | 'info' - tipo de notificação
// - onClose: Função - chamada ao fechar
// - duration: Number - milissegundos até auto-fechar (padrão: 3000)
//
// EXEMPLO DE USO:
// <Toast
//   message="Livro reservado com sucesso!"
//   type="success"
//   onClose={() => setToastMessage('')}
//   duration={3000}
// />
//
// FLUXO:
// 1. Toast aparece com animação
// 2. Aguarda 'duration' milissegundos
// 3. Ativa animação de saída (300ms)
// 4. Chama onClose() para remover do estado

import React, { useEffect, useState } from 'react';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - Toast
// ==========================================
const Toast = ({ message, type, onClose, duration = 3000 }) => {
  // ------------------------------------------
  // ESTADO LOCAL
  // ------------------------------------------
  // isClosing: Controla animação de saída
  // true = aplica classe 'toast-closing' com animação fade-out
  const [isClosing, setIsClosing] = useState(false);

  // ==========================================
  // EFEITO: Timer de auto-fechar
  // ==========================================
  // O QUÊ: Fecha toast automaticamente após 'duration'
  // QUANDO: Sempre que message ou duration mudar
  // CLEANUP: Limpa timer se componente desmontar antes
  useEffect(() => {
    if (message) {
      // Cria timer que chama handleClose após 'duration' ms
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      // Cleanup: cancela timer se componente desmontar
      // Previne chamar handleClose em componente desmontado
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  // ==========================================
  // FUNÇÃO: handleClose
  // ==========================================
  // O QUÊ: Fecha toast com animação suave
  // COMO:
  //   1. Ativa isClosing (animação fade-out)
  //   2. Aguarda 300ms (duração da animação CSS)
  //   3. Chama onClose() (remove toast do estado do pai)
  //   4. Reseta isClosing para falso
  const handleClose = () => {
    setIsClosing(true); // Inicia animação de saída
    
    setTimeout(() => {
      onClose();           // Remove do DOM
      setIsClosing(false); // Reseta para próximo uso
    }, 300); // Tempo igual à duração da animação CSS
  };

  // Se não há mensagem, não renderiza nada
  if (!message) return null;

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    // ------------------------------------------
    // CONTAINER DO TOAST
    // ------------------------------------------
    // Classes dinâmicas:
    // - toast-{type}: define cor (success/error/info)
    // - toast-closing: aplica animação fade-out
    <div className={`toast toast-${type} ${isClosing ? 'toast-closing' : ''}`}>
      {/* ------------------------------------------
          CONTEÚDO
          ------------------------------------------ */}
      <div className="toast-content">
        {/* Ícone conforme tipo de notificação */}
        <span className="toast-icon">
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </span>
        {/* Mensagem de texto */}
        <span className="toast-message">{message}</span>
      </div>
      
      {/* Botão manual de fechar (×) */}
      <button className="toast-close" onClick={handleClose}>×</button>
    </div>
  );
};

export default Toast;
