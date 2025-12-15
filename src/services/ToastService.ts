import Swal from 'sweetalert2';

type ToastIcon = 'success' | 'error' | 'warning' | 'info';

const toast = (icon: ToastIcon, title: string) => {
    Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon,
        title,
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
    });
};

const confirmDelete = (title: string, text: string): Promise<boolean> => {
    return Swal.fire({
        title,
        text,
        icon: 'warning',
        iconColor: '#ef4444',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-trash me-1"></i> Supprimer',
        cancelButtonText: 'Annuler',
        buttonsStyling: false,
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            htmlContainer: 'swal-custom-text',
            confirmButton: 'swal-btn-confirm',
            cancelButton: 'swal-btn-cancel',
            actions: 'swal-custom-actions',
        },
        reverseButtons: true,
    }).then((result) => result.isConfirmed);
};

export const Toast = {
    success: (message: string) => toast('success', message),
    error: (message: string) => toast('error', message),
    warning: (message: string) => toast('warning', message),
    info: (message: string) => toast('info', message),
    confirmDelete,
};
