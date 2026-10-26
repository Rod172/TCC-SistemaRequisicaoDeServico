/** US40: metadados publicados e validação do aceite explícito, sem consentimento genérico. */
import documentos from '../config/documentos-legais.json';
import HttpError from '../utils/HttpError';
export { documentos };
export interface AceiteDocumentos {
  termos_uso_aceitos?: boolean;
  privacidade_ciente?: boolean;
  termos_uso_versao?: string;
  privacidade_versao?: string;
}
export function validarAceiteDocumentos(dados: AceiteDocumentos) {
  if (dados.termos_uso_aceitos !== true || dados.privacidade_ciente !== true) {
    throw new HttpError(400, 'Aceite os Termos de Uso e confirme a leitura da Política de Privacidade.');
  }
  if (dados.termos_uso_versao !== documentos.versao_termos || dados.privacidade_versao !== documentos.versao_privacidade) {
    throw new HttpError(400, 'A versão dos documentos mudou ou não foi informada. Recarregue o cadastro e leia os documentos vigentes.');
  }
  return { termos_uso_versao: documentos.versao_termos, privacidade_versao: documentos.versao_privacidade, documentos_aceitos_em: new Date() };
}
