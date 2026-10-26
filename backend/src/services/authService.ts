import { AceiteDocumentos, validarAceiteDocumentos } from './documentosLegaisService';
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

import { validarDocumento } from '../validators/documento';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/jwt';
import sequelize from '../config/database';
import { Usuario, PrestadorPerfil } from '../models';

export interface RegisterSolicitanteDTO extends AceiteDocumentos {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco?: string;
  foto_url?: string;
  senha: string;
  /** Compatibilidade: não é consentimento genérico nem substitui o aceite versionado. */
  termo_lgpd_aceito?: boolean;
}

export interface RegisterPrestadorDTO extends AceiteDocumentos {
  nome: string;
  email: string;
  cnpj_cpf: string;
  telefone: string;
  endereco?: string;
  foto_url?: string;
  senha: string;
  descricao_bio?: string;
  categorias: string[];
  /** Compatibilidade: não é consentimento genérico nem substitui o aceite versionado. */
  termo_lgpd_aceito?: boolean;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

/** Limites do cadastro: e-mail até 150 caracteres e senha de 8 caracteres até 72 bytes (bcrypt). */
function validarCredenciaisCadastro(email: unknown, senha: unknown): asserts email is string {
  if (typeof email !== 'string' || email.trim().length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw Object.assign(new Error('E-mail inválido: informe um endereço de até 150 caracteres.'), { status: 400 });
  }
  if (typeof senha !== 'string' || senha.length < 8 || Buffer.byteLength(senha, 'utf8') > 72) {
    throw Object.assign(new Error('Senha inválida: use pelo menos 8 caracteres e no máximo 72 bytes.'), { status: 400 });
  }
}

/** Valida tipos antes de aplicar trim e respeita os limites das colunas do cadastro. */
function validarDadosCadastro(nome: unknown, telefone: unknown, endereco: unknown): void {
  if (typeof nome !== 'string' || !nome.trim() || nome.trim().length > 150) {
    throw Object.assign(new Error('Nome inválido: informe um texto não vazio de até 150 caracteres.'), { status: 400 });
  }
  if (typeof telefone !== 'string' || !telefone.trim() || telefone.trim().length > 20) {
    throw Object.assign(new Error('Telefone inválido: informe um texto não vazio de até 20 caracteres.'), { status: 400 });
  }
  if (endereco !== undefined && (typeof endereco !== 'string' || endereco.trim().length > 255)) {
    throw Object.assign(new Error('Endereço inválido: informe um texto de até 255 caracteres.'), { status: 400 });
  }
}

export class AuthService {
  /**
   * Registra um novo usuário Solicitante (Cliente) com senha protegida, aceite dos Termos e ciência da Política de Privacidade.
   */
  async registerSolicitante(data: RegisterSolicitanteDTO) {
    const { nome, email, cpf, telefone, endereco, foto_url, senha, termo_lgpd_aceito } = data;

    if (termo_lgpd_aceito !== undefined && termo_lgpd_aceito !== true) {
      throw Object.assign(new Error('É obrigatório aceitar os Termos de Uso e confirmar a ciência da Política de Privacidade.'), { status: 400 });
    }

    const registroDocumentos = validarAceiteDocumentos(data);
    validarDadosCadastro(nome, telefone, endereco);
    validarCredenciaisCadastro(email, senha);
    const documento = validarDocumento(cpf);

    const emailExistente = await Usuario.findOne({ where: { email: email.toLowerCase().trim() } });
    if (emailExistente) {
      throw new Error('O e-mail informado já está cadastrado no sistema.');
    }

    const cpfExistente = await Usuario.findOne({ where: { cpf: documento } });
    if (cpfExistente) {
      throw new Error('O CPF informado já está cadastrado no sistema.');
    }

    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(senha, saltRounds);

    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      cpf: documento,
      telefone: telefone.trim(),
      endereco: endereco ? endereco.trim() : undefined,
      foto_url,
      senha_hash,
      ...registroDocumentos,
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
    const { nome, email, cnpj_cpf, telefone, endereco, foto_url, senha, descricao_bio, categorias, termo_lgpd_aceito } = data;

    if (termo_lgpd_aceito !== undefined && termo_lgpd_aceito !== true) {
      throw Object.assign(new Error('É obrigatório aceitar os Termos de Uso e confirmar a ciência da Política de Privacidade.'), { status: 400 });
    }

    if (!Array.isArray(categorias) || categorias.length === 0 || categorias.some(categoria => typeof categoria !== 'string' || !categoria.trim())) {
      throw Object.assign(new Error('Categorias inválidas: informe ao menos uma categoria de atuação profissional, usando textos não vazios.'), { status: 400 });
    }
    if (descricao_bio !== undefined && typeof descricao_bio !== 'string') {
      throw Object.assign(new Error('Descrição inválida: informe um texto para a biografia.'), { status: 400 });
    }

    const registroDocumentos = validarAceiteDocumentos(data);
    validarDadosCadastro(nome, telefone, endereco);
    validarCredenciaisCadastro(email, senha);
    const documento = validarDocumento(cnpj_cpf, true);

    const emailExistente = await Usuario.findOne({ where: { email: email.toLowerCase().trim() } });
    if (emailExistente) {
      throw new Error('O e-mail informado já está cadastrado no sistema.');
    }

    const docExistente = await Usuario.findOne({ where: { cpf: documento } });
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
          cpf: documento,
          telefone: telefone.trim(),
          endereco: endereco ? endereco.trim() : undefined,
          foto_url,
          senha_hash,
          ...registroDocumentos,
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
          cnpj_cpf: documento,
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
    const { email, senha } = credentials || {};
    if (typeof email !== 'string' || typeof senha !== 'string') {
      throw Object.assign(new Error('E-mail ou senha incorretos.'), { status: 401 });
    }

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

    const secret = getJwtSecret();
    const expiresIn = (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn'];

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo_perfil: usuario.tipo_perfil,
      },
      secret,
      { expiresIn, algorithm: 'HS256' }
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
