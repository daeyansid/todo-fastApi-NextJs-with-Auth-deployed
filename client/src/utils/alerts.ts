import Swal from 'sweetalert2';

export const showSuccessAlert = (title: string, text: string) => {
    return Swal.fire({
        title,
        text,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });
};

export const showErrorAlert = (title: string, text: string) => {
    return Swal.fire({
        title,
        text,
        icon: 'error',
        timer: 3000,
        showConfirmButton: true,
        position: 'center'
    });
};

export const showLoadingAlert = (title: string = 'Loading...') => {
    return Swal.fire({
        title,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

export const closeLoadingAlert = () => {
    Swal.close();
};
