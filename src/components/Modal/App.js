// ==========================================
// COMPONENTE: Modal
// ==========================================
// Modal reutilizável para diálogos de confirmação
//
// FUNCIONALIDADES:
// - ❓ Diálogo genérico de confirmação
// - 🎨 Tipos diferentes (default, danger)
// - ❌ Fechar clicando no overlay
// - 🚫 Previne fechar clicando dentro do modal (stopPropagation)
// - ⌨️ Botões customizáveis
//
// PROPS:
// - isOpen: Boolean - modal visível ou não
// - title: String - título do modal
// - message: String - mensagem/descrição
// - onConfirm: Função - chamada ao clicar "Confirmar"
// - onCancel: Função - chamada ao clicar "Cancelar" ou fechar
// - confirmText: String - texto do botão confirmar (padrão: "Confirmar")
// - cancelText: String - texto do botão cancelar (padrão: "Cancelar")
// - type: 'default' | 'danger' - estilo do botão confirmar
//
// EXEMPLO DE USO:
// <Modal
//   isOpen={showModal}
//   title="Eliminar conta"
//   message="Tem certeza? Esta ação é irreversível."
//   onConfirm={handleDelete}
//   onCancel={() => setShowModal(false)}
//   confirmText="Sim, eliminar"
//   type="danger"
// />

import React from 'react';
import '../../styles/App.css';

// ==========================================
// COMPONENTE PRINCIPAL - Modal
// ==========================================
const Modal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirmar',  // Valor padrão
  cancelText = 'Cancelar',    // Valor padrão
  type = 'default'             // Valor padrão
}) => {
  // Se modal não está aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    // ------------------------------------------
    // OVERLAY
    // ------------------------------------------
    // Fundo semi-transparente que cobre toda a tela
    // onClick={onCancel}: Fecha modal ao clicar fora
    <div className="modal-overlay" onClick={onCancel}>
      {/* ------------------------------------------
          CONTEÚDO DO MODAL
          ------------------------------------------
          onClick stopPropagation: previne fechar ao clicar dentro
          Se não tivesse isto, clicar em qualquer lugar fecharia
      */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* ------------------------------------------
            CABEÇALHO
            ------------------------------------------ */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        
        {/* ------------------------------------------
            CORPO (Mensagem)
            ------------------------------------------ */}
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        {/* ------------------------------------------
            RODAPÉ (Botões)
            ------------------------------------------
            Ordem: Cancelar (esquerda) + Confirmar (direita)
        */}
        <div className="modal-footer">
          {/* Botão Cancelar (estilo secundário) */}
          <button className="modal-button modal-button-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          
          {/* Botão Confirmar (estilo primário ou danger) */}
          <button 
            className={`modal-button modal-button-confirm ${type === 'danger' ? 'modal-button-danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
