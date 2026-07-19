import { toast } from 'react-toastify';

export const showToast = {
    success: (message) => toast.success(message, { position: 'bottom-right', autoClose: 3000 }),
    error: (message) => toast.error(message, { position: 'bottom-right', autoClose: 3000 }),
    info: (message) => toast.info(message, { position: 'bottom-right', autoClose: 3000 }),
    warning: (message) => toast.warning(message, { position: 'bottom-right', autoClose: 3000 }),
    loading: (message) => toast.loading(message, { position: 'bottom-right' })
};
