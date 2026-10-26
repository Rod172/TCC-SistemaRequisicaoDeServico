/** Express 4 Router: canal autenticado e administração separada (US40).
 * https://expressjs.com/pt-br/guide/routing.html */
import { Router } from 'express';
import auth from '../middlewares/authMiddleware';
import admin from '../middlewares/adminMiddleware';
import c from '../controllers/privacidadeController';
const router = Router();
router.get('/legal/documentos', c.metadados);
router.get('/privacidade/minha-central', auth, c.central);
router.post('/privacidade/solicitacoes', auth, c.criar);
router.get('/admin/privacidade', auth, admin, c.listar);
router.patch('/admin/privacidade/:id/resposta', auth, admin, c.responder);
export default router;
