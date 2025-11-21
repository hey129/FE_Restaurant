import toast from "react-hot-toast";

const TOAST_DURATION = 2000;

export const showSuccess = (message, duration = TOAST_DURATION) => {
  return toast.success(message, { duration });
};

export const showError = (message, duration = TOAST_DURATION) => {
  return toast.error(message, { duration });
};

export const showLoading = (message) => {
  return toast.loading(message);
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
