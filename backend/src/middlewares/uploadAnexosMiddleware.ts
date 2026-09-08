/**
 * @file uploadAnexosMiddleware.ts
 * @description Middleware Multer para upload dos anexos (fotos/documentos) de uma solicitação de
 * serviço (US05), com limite de 5 arquivos de até 10MB cada.
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

const UPLOAD_DIR = path.join(__dirname, '../../uploads/solicitacoes');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024; // 10 MB
const MAXIMO_ARQUIVOS = 5;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nomeUnico = `${crypto.randomUUID()}${extensao}`;
    cb(null, nomeUnico);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
    return cb(new Error('Formato de arquivo inválido. Envie imagens (JPEG, PNG, WEBP) ou PDF.'));
  }
  cb(null, true);
};

export const uploadAnexosSolicitacao = multer({
  storage,
  fileFilter,
  limits: { fileSize: TAMANHO_MAXIMO_BYTES, files: MAXIMO_ARQUIVOS },
});

export default uploadAnexosSolicitacao;
