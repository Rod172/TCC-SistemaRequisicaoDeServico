/**
 * @file HttpError.ts
 * @description Erro de aplicação com status HTTP embutido, usado pelos services para sinalizar
 * a resposta correta (400/404/409...) sem acoplar a camada de negócio ao Express.
 */

export class HttpError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

export default HttpError;
