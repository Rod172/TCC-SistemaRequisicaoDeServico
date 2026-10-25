/**
 * Controladores dos indicadores pessoais (US20/US21).
 * Express (^4.19.2): requisições autenticadas, respostas e encaminhamento de erros.
 * Documentação oficial: https://expressjs.com/pt-br/guide/error-handling.html
 */
import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboardService';

export class DashboardController {
  async solicitante(req: Request, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ message: 'Autenticação necessária.' });
    try {
      return res.json({ dados: await dashboardService.solicitante(req.user.id) });
    } catch (erro) { return next(erro); }
  }

  async prestador(req: Request, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ message: 'Autenticação necessária.' });
    if (!['PRESTADOR', 'ADMIN'].includes(req.user.tipo_perfil)) {
      return res.status(403).json({ message: 'Este painel está disponível para prestadores e administradores.' });
    }
    try {
      return res.json({ dados: await dashboardService.prestador(req.user.id) });
    } catch (erro) { return next(erro); }
  }
}

export default new DashboardController();
