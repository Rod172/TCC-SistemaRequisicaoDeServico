/**
 * @file chatSocket.ts
 * @description Servidor WebSocket (Socket.io) do chat privado entre Solicitante e Prestador (US14) e
 * das notificações em tempo real (US16). Responsável apenas por autenticação da conexão e
 * gerenciamento de "salas" (uma por proposta desde a US34 — permite vários prestadores concorrentes
 * conversando com o mesmo solicitante sem se verem —, mais uma sala pessoal `usuario:<id>` por onde
 * cada usuário recebe suas próprias notificações) — o envio/leitura de mensagens e a criação de
 * notificações continuam passando pela API REST (nos controllers/services de origem), que usam
 * `emitirParaSala`/`emitirParaUsuario` daqui pra notificar em tempo real. Isso evita duplicar a regra
 * de negócio (validação, persistência) em dois lugares diferentes.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Socket.io (^4.8.3): Comunicação bidirecional em tempo real via WebSocket (com fallback de polling).
 *    Doc Oficial: https://socket.io/docs/v4/
 * 2. JSON Web Token (^9.0.2): Validação do token JWT enviado no handshake da conexão.
 *    Doc Oficial: https://github.com/auth0/node-jsonwebtoken
 */

import { Server as HttpServer } from 'http';
import { Server as SocketIoServer, Socket } from 'socket.io';
import { authenticateToken, getJwtSecret } from '../config/jwt';
import { UserPayload } from '../middlewares/authMiddleware';
import chatService from '../services/chatService';

let io: SocketIoServer | null = null;

function nomeSala(propostaId: string) {
  return `proposta:${propostaId}`;
}

function nomeSalaUsuario(usuarioId: string) {
  return `usuario:${usuarioId}`;
}

export function initChatSocket(httpServer: HttpServer): SocketIoServer {
  getJwtSecret();
  io = new SocketIoServer(httpServer, {
    cors: { origin: '*' },
  });

  // Autentica a conexão usando o mesmo JWT emitido pelo login REST (US03).
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth?.token;

    if (typeof token !== 'string' || !token) {
      return next(new Error('Token de autenticação não fornecido.'));
    }

    try {
      const usuario = await authenticateToken(token);
      socket.data.usuario = usuario;
      return next();
    } catch {
      return next(new Error('Token de autenticação inválido ou expirado.'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const usuario = socket.data.usuario as UserPayload;

    // Cada usuário entra automaticamente na própria sala pessoal, por onde recebe notificações (US16).
    socket.join(nomeSalaUsuario(usuario.id));

    // Entrar numa sala exige ser o solicitante dono da solicitação ou o prestador dono da proposta
    // (verificado pelo mesmo service usado pela API REST) — evita que qualquer usuário logado escute
    // o chat alheio. Desde a US34 o parâmetro é o id da PROPOSTA, não mais da solicitação.
    socket.on('entrar-sala', async (propostaId: string) => {
      try {
        socket.data.usuario = await authenticateToken(socket.handshake.auth.token);
        await chatService.verificarParticipante(propostaId, usuario.id);
        socket.join(nomeSala(propostaId));
      } catch {
        socket.emit('erro', { mensagem: 'Você não tem acesso a este chat.' });
      }
    });

    socket.on('sair-sala', (propostaId: string) => {
      socket.leave(nomeSala(propostaId));
    });
  });

  return io;
}

/** Usado pelo chatController após persistir uma ação via REST, pra notificar quem está na sala. */
export function emitirParaSala(propostaId: string, evento: string, dados: unknown) {
  io?.to(nomeSala(propostaId)).emit(evento, dados);
}

/** Usado pelos services que criam uma Notificacao (US16), pra atualizar o sino em tempo real. */
export function emitirParaUsuario(usuarioId: string, evento: string, dados: unknown) {
  io?.to(nomeSalaUsuario(usuarioId)).emit(evento, dados);
}
