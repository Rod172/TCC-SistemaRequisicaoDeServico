/**
 * express-rate-limit (8.7.1): limita tentativas de login por IP a 10 a cada 15 minutos,
 * reduzindo ataques de força bruta. Armazenamento em memória por instância do servidor.
 * Documentação oficial: https://express-rate-limit.mintlify.app/reference/configuration
 */
import { rateLimit } from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'TooManyRequests', message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});
