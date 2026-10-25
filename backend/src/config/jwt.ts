/**
 * Configuração JWT compartilhada. jsonwebtoken (^9.0.2) verifica assinaturas HS256.
 * Documentação oficial: https://github.com/auth0/node-jsonwebtoken
 * Sequelize (^6.37.3) consulta o estado atual da conta, sem carregar senhas.
 * Documentação oficial: https://sequelize.org/docs/v6/
 */
import jwt from 'jsonwebtoken';
import { Usuario } from '../models';
import type { UserPayload } from '../middlewares/authMiddleware';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32 || secret === 'tcc_secret_key_super_segura_2026') {
    throw new Error('Configuração inválida: JWT_SECRET deve conter pelo menos 32 caracteres e não pode usar o segredo padrão.');
  }
  return secret;
}

/** O JWT identifica a conta; permissões e e-mail sempre refletem o cadastro atual. */
export async function authenticateToken(token: string): Promise<UserPayload> {
  const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
  if (typeof decoded === 'string' || typeof decoded.id !== 'string' || !decoded.id) {
    throw new Error('Token de autenticação inválido.');
  }
  const usuario = await Usuario.findByPk(decoded.id, {
    attributes: ['id', 'email', 'tipo_perfil', 'ativo'],
  });
  if (!usuario || !usuario.ativo || !['SOLICITANTE', 'PRESTADOR', 'ADMIN'].includes(usuario.tipo_perfil)) {
    throw new Error('Conta inexistente, desativada ou com perfil inválido.');
  }
  return { id: usuario.id, email: usuario.email, tipo_perfil: usuario.tipo_perfil };
}
