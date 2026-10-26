/** Express 4: interface HTTP do canal de privacidade (US40).
 * https://expressjs.com/pt-br/4x/api.html */
import { Request, Response, NextFunction } from 'express';
import servico from '../services/privacidadeService';
import { documentos } from '../services/documentosLegaisService';
export const metadados = (_req: Request, res: Response) => res.json({ data: documentos });
export async function central(req: Request, res: Response, next: NextFunction) {
 try { res.json({ data: await servico.minhaCentral(req.user!.id) }); } catch (e) { next(e); }
}
export async function criar(req: Request, res: Response, next: NextFunction) {
 try { res.status(201).json({ data: await servico.criar(req.user!.id, req.body.tipo, req.body.descricao) }); } catch (e) { next(e); }
}
export async function listar(req: Request, res: Response, next: NextFunction) {
 try { res.json(await servico.listarAdministracao(req.query.pagina)); } catch (e) { next(e); }
}
export async function responder(req: Request, res: Response, next: NextFunction) {
 try { res.json({ data: await servico.responder(req.params.id, req.user!.id, req.body.resposta) }); } catch (e) { next(e); }
}

export default { metadados, central, criar, listar, responder };
