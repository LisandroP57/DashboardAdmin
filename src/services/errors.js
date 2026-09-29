export class AppError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

// Solo se muestran al usuario los errores controlados; el resto se reemplaza por un mensaje genérico.
export const getErrorMessage = (error, fallback = "Ocurrió un error inesperado. Intentá de nuevo.") =>
  error instanceof AppError ? error.message : fallback;
