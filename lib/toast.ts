/**
 * Lightweight error notification helper.
 * Shows a brief alert for failed API operations so the user knows something went wrong.
 */
export const toast = {
  error(message: string) {
    // Using a simple alert as a baseline.
    // Can be replaced with a toast library (sonner, react-hot-toast) later.
    window.alert(message);
  },
};
