export class HttpError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message, details) =>
  new HttpError(400, message, details);
export const unauthorized = (message = "Não autenticado.") =>
  new HttpError(401, message);
export const forbidden = (message = "Acesso negado.") =>
  new HttpError(403, message);
export const notFound = (message = "Recurso não encontrado.") =>
  new HttpError(404, message);
