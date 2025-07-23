'use client';

import { useState } from 'react';

export function useMessageModal() {
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: null,
        showCancel: false
    });

    const closeModal = () => {
        setModal({ isOpen: false });
    };

    const showError = (title, message) => {
        setModal({
            isOpen: true,
            type: 'error',
            title,
            message,
            onConfirm: closeModal,
            showCancel: false
        });
    };

    const showSuccess = (title, message, onClose = null) => {
        setModal({
            isOpen: true,
            type: 'success',
            title,
            message,
            onConfirm: () => {
                closeModal();
                if (onClose) onClose(); // 콜백 실행
            },
            showCancel: false
        });
    };
    const showWarning = (title, message) => {
        setModal({
            isOpen: true,
            type: 'warning',
            title,
            message,
            onConfirm: closeModal,
            showCancel: false
        });
    };

    const showConfirm = (title, message, onConfirm) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            title,
            message,
            onConfirm,
            showCancel: true
        });
    };

    return {
        modal,
        closeModal,
        showError,
        showSuccess,
        showWarning,
        showConfirm
    };
}