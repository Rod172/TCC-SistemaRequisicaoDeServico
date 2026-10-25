/**
 * Controlador do perfil público (US19).
 * Express (^4.19.2): tipos HTTP e respostas REST.
 * Documentação oficial: https://expressjs.com/pt-br/4x/api.html
 */
import { Request, Response, NextFunction } from 'express';
import prestadorPublicoService from '../services/prestadorPublicoService';
import HttpError from '../utils/HttpError';

export class PrestadorPublicoController {
  async buscarPerfilPublico(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await prestadorPublicoService.buscarPerfilPublico(req.params.id, req.query.pagina, req.query.limite);
      res.status(200).json({ data });
    } catch (erro: unknown) {
      if (erro instanceof HttpError) {
        res.status(erro.status).json({ error: erro.name, message: erro.message });
        return;
      }
      // Não propaga mensagens de banco que possam conter informações privadas.
      next(new Error('Não foi possível carregar o perfil público do prestador.'));
    }
  }
}

export default new PrestadorPublicoController();
