/** Jest 30: contrato de documentos/aceite; Node fs: compara manifestos públicos.
 * https://jestjs.io/docs/api | https://nodejs.org/api/fs.html */
const { documentos, validarAceiteDocumentos } = require('../dist/services/documentosLegaisService');
const publico = require('../../frontend/src/conteudo/documentos-legais.json');
const valido = { termos_uso_aceitos: true, privacidade_ciente: true, termos_uso_versao: documentos.versao_termos, privacidade_versao: documentos.versao_privacidade };
test('metadados do frontend e backend são idênticos e têm contato configurado',()=>{expect(publico).toEqual(documentos);expect(documentos.email_privacidade).toBe('rodrigofernandomelo15@gmail.com');});
test.each([
 {},{termos_uso_aceitos:false},{termos_uso_aceitos:'true'},{termos_uso_aceitos:1},
 {privacidade_ciente:false},{privacidade_ciente:'true'},{termos_uso_versao:'antiga'},{privacidade_versao:'antiga'},
 {termos_uso_versao:null},{privacidade_versao:undefined},
])('rejeita ausência, coerção ou versão divergente: %j',alteracao=>{
 const dados=Object.keys(alteracao).length ? {...valido,...alteracao} : {};
 expect(()=>validarAceiteDocumentos(dados)).toThrow();
});
test('aceite usa data do servidor e não data declarada pelo cliente',()=>{
 const antes=Date.now(); const resultado=validarAceiteDocumentos({...valido,documentos_aceitos_em:'1900-01-01'});
 expect(resultado.termos_uso_versao).toBe(documentos.versao_termos);
 expect(resultado.documentos_aceitos_em.getTime()).toBeGreaterThanOrEqual(antes);
 expect(resultado.documentos_aceitos_em.getTime()).toBeLessThanOrEqual(Date.now());
});

test('arquivo publicado preserva o conteúdo e os metadados da versão atual',()=>{const publicado=require('../../frontend/src/conteudo/legal/'+documentos.versao_termos+'.json');expect(publicado.documentos).toEqual(documentos);expect(publicado.termos.length).toBeGreaterThan(5);expect(publicado.privacidade.length).toBeGreaterThan(5);});
