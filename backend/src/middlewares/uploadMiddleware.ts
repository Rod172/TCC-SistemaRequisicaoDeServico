/**
 * @file uploadMiddleware.ts
 * @description Middleware Multer para upload da foto de perfil do usuário (US04), com validação de tipo/tamanho e nome de arquivo único.
 *
 * BIBLIOTECAS UTILIZADAS:
 * 1. Multer (^2.3.0): Middleware Express para parsing de `multipart/form-data` e upload de arquivos em disco.
 *    Doc Oficial: https://github.com/expressjs/multer
 */

import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import HttpError from '../utils/HttpError';

const UPLOAD_DIR = path.join(__dirname, '../../uploads/perfil');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // A extensão acompanha o tipo permitido, não o nome fornecido pelo usuário.
    const extensao = ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'application/pdf': '.pdf' } as Record<string, string>)[file.mimetype];
    const nomeUnico = `${crypto.randomUUID()}${extensao}`;
    cb(null, nomeUnico);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
    return cb(new HttpError(400, 'Formato de imagem inválido. Envie um arquivo JPEG, PNG ou WEBP.'));
  }
  cb(null, true);
};

export const uploadFotoPerfil = multer({
  storage,
  fileFilter,
  limits: { fileSize: TAMANHO_MAXIMO_BYTES },
});

export default uploadFotoPerfil;
