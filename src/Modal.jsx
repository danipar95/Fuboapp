import React, { useEffect } from 'react';
import './FootballField.css';

const Modal = ({ message, onClose, onConfirm, showButtons = false }) => {
    useEffect(() => {
        if (!showButtons) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [onClose, showButtons]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <p>{message}</p>
                {showButtons && (
                    <div className="modal-actions">
                        <button onClick={onConfirm} className="modal-button confirm">Sí</button>
                        <button onClick={onClose} className="modal-button cancel">No</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;