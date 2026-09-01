/**
 * @file authService.ts
 * @description Serviço de regras de negócio para cadastro de Solicitantes, Prestadores, Login e emissão de JWT.
 * 
 * BIBLIOTECAS UTILIZADAS:
 * 1. BcryptJS (^2.4.3): Algoritmo de hashing seguro de senhas e comparação bcrypt.compare.
 *    Doc Oficial: https://github.com/dcodeIO/bcrypt.js
 * 2. JSON Web Token (^9.0.2): Assinatura e geração de tokens JWT para autenticação.
 *    Doc Oficial: https://github.com/auth0/node-jsonwebtoken
 * 3. Sequelize ORM (^6.37.3): Transações bancárias e busca relacional com include.
 *    Doc Oficial: https://sequelize.org/docs/v6/
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../config/database';
import { Usuario, PrestadorPerfil } from '../models';

export interface RegisterSolicitanteDTO {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco?: string;
  senha: string;
  termo_lgpd_aceito: boolean;
}

export interface RegisterPrestadorDTO {
  nome: string;
  email: string;
  cnpj_cpf: string;
  telefone: string;
  endereco?: string;
  senha: string;
  descricao_bio?: string;
  categorias: string[];
  termo_lgpd_aceito: boolean;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

export class AuthService {
  /**
   * Registra um novo usuário Solicitante (Cliente) com senha criptografada e consentimento LGPD.
   */
  async registerSolicitante(data: RegisterSolicitanteDTO) {
    const { nome, email, cpf, telefone, endereco, senha, termo_lgpd_aceito } = data;

    if (!termo_lgpd_aceito) {
      throw new Error('É obrigatório aceitar o termo de consentimento da LGPD para se cadastrar.');
    }

    const emailExistente = await Usuario.findOne({ where: { email: email.toLowerCase().trim() } });
    if (emailExistente) {
      throw new Error('O e-mail informado já está cadastrado no sistema.');
    }

    const cpfExistente = await Usuario.findOne({ where: { cpf: cpf.trim() } });
    if (cpfExistente) {
      throw new Error('O CPF informado já está cadastrado no sistema.');
    }

    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(senha, saltRounds);

    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      cpf: cpf.trim(),
      telefone: telefone.trim(),
      endereco: endereco ? endereco.trim() : undefined,
      senha_hash,
      tipo_perfil: 'SOLICITANTE',
      termo_lgpd_aceito: true,
      termo_lgpd_aceito_em: new Date(),
      ativo: true,
    });

    const { senha_hash: _, ...usuarioSanitizado } = novoUsuario.toJSON();
    return usuarioSanitizado;
  }

  /**
   * Registra um novo Prestador de Serviço (Profissional) criando o usuário base e o perfil profissional em transação atômica.
   */
  async registerPrestador(data: RegisterPrestadorDTO) {
    const { nome, email, cnpj_cpf, telefone, endereco, senha, descricao_bio, categorias, termo_lgpd_aceito } = data;

    if (!termo_lgpd_aceito) {
      throw new Error('É obrigatório aceitar o termo de consentimento da LGPD para se cadastrar.');
    }

    if (!categorias || !Array.isArray(categorias) || categorias.length === 0) {
      throw new Error('Informe ao menos uma categoria de atuação profissional.');
    }

    const emailExistente = await Usuario.findOne({ where: { email: email.toLowerCase().trim() } });
    if (emailExistente) {
      throw new Error('O e-mail informado já está cadastrado no sistema.');
    }

    const docExistente = await Usuario.findOne({ where: { cpf: cnpj_cpf.trim() } });
    if (docExistente) {
      throw new Error('O CPF/CNPJ informado já está cadastrado no sistema.');
    }

    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(senha, saltRounds);

    const resultado = await sequelize.transaction(async (transaction) => {
      const novoUsuario = await Usuario.create(
        {
          nome: nome.trim(),
          email: email.toLowerCase().trim(),
          cpf: cnpj_cpf.trim(),
          telefone: telefone.trim(),
          endereco: endereco ? endereco.trim() : undefined,
          senha_hash,
          tipo_perfil: 'PRESTADOR',
          termo_lgpd_aceito: true,
          termo_lgpd_aceito_em: new Date(),
          ativo: true,
        },
        { transaction }
      );

      const novoPerfil = await PrestadorPerfil.create(
        {
          usuario_id: novoUsuario.id,
          cnpj_cpf: cnpj_cpf.trim(),
          descricao_bio: descricao_bio ? descricao_bio.trim() : undefined,
          categorias,
          nota_media_reputacao: 0.00,
          total_avaliacoes: 0,
        },
        { transaction }
      );

      const { senha_hash: _, ...usuarioSanitizado } = novoUsuario.toJSON();
      return {
        ...usuarioSanitizado,
        perfil_prestador: novoPerfil.toJSON(),
      };
    });

    return resultado;
  }

  /**
   * Autentica um usuário por e-mail e senha, emitindo um token JWT de acesso.
   */
  async login(credentials: LoginDTO) {
    const { email, senha } = credentials;

    const usuario = await Usuario.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [
        {
          model: PrestadorPerfil,
          as: 'perfil_prestador',
          required: false,
        },
      ],
    });

    if (!usuario) {
      throw new Error('E-mail ou senha incorretos.');
    }

    if (!usuario.ativo) {
      throw new Error('Esta conta de usuário foi desativada.');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const secret = process.env.JWT_SECRET || 'tcc_secret_key_super_segura_2026';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn'];

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo_perfil: usuario.tipo_perfil,
      },
      secret,
      { expiresIn }
    );

    const { senha_hash: _, ...usuarioSanitizado } = usuario.toJSON();

    return {
      token,
      usuario: usuarioSanitizado,
    };
  }

  /**
   * Retorna os dados cadastrais e perfil do usuário logado a partir do ID do JWT.
   */
  async getUserProfile(usuarioId: string) {
    const usuario = await Usuario.findByPk(usuarioId, {
      include: [
        {
          model: PrestadorPerfil,
          as: 'perfil_prestador',
          required: false,
        },
      ],
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }

    const { senha_hash: _, ...usuarioSanitizado } = usuario.toJSON();
    return usuarioSanitizado;
  }
}

export default new AuthService();
