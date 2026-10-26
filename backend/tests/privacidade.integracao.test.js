/** US40: rotas reais com MySQL isolado, sem mocks.
 * Jest 30 https://jestjs.io/docs/api | Supertest 7 https://github.com/forwardemail/supertest
 * Sequelize 6 https://sequelize.org/docs/v6/ */
require('./ambiente.cjs')();
const request=require('supertest'); const {randomUUID,randomInt}=require('node:crypto');
const banco=require('../dist/config/database').default;
const app=require('../dist/app').default;
const {Usuario,SolicitacaoPrivacidade,PrestadorPerfil}=require('../dist/models');
const {documentos}=require('../dist/services/documentosLegaisService');
const ids=[];let a,b,admin;
const aceite={termos_uso_aceitos:true,privacidade_ciente:true,termos_uso_versao:documentos.versao_termos,privacidade_versao:documentos.versao_privacidade};
function cpf(){const d=Array.from({length:9},()=>randomInt(0,10));for(const n of [9,10]){const v=d.reduce((s,x,i)=>s+x*(n+1-i),0)*10%11;d.push(v===10?0:v);}return d.join('');}
async function novo(tipo='solicitante'){
 const email=`privacidade-${randomUUID()}@example.test`;
 const r=await request(app).post(`/api/v1/auth/register/${tipo}`).send({nome:'Pessoa fictícia US40',email,senha:'Privacidade123!',telefone:'11999999999',cpf:cpf(),cnpj_cpf:cpf(),categorias:['ELETRICA'],termo_lgpd_aceito:true,...aceite}).expect(201);
 ids.push(r.body.data.id);
 const login=await request(app).post('/api/v1/auth/login').send({email,senha:'Privacidade123!'}).expect(200);
 return {...r.body.data,token:login.body.data.token};
}
function auth(r,u=a){return r.set('Authorization',`Bearer ${u.token}`);}
const pedido=()=>auth(request(app).post('/api/v1/privacidade/solicitacoes')).send({tipo:'ACESSO',descricao:'Solicitação fictícia para validar direitos e isolamento.'});
beforeAll(async()=>{a=await novo();b=await novo('prestador');admin=await novo();await Usuario.update({tipo_perfil:'ADMIN'},{where:{id:admin.id}});});
afterAll(async()=>{try{await SolicitacaoPrivacidade.destroy({where:{usuario_id:ids}});await PrestadorPerfil.destroy({where:{usuario_id:ids}});await Usuario.destroy({where:{id:ids}});}finally{await banco.close();}});
test('documentos são públicos e publicam as versões e contato',async()=>{const r=await request(app).get('/api/v1/legal/documentos').expect(200);expect(r.body.data).toEqual(documentos);});
test('cadastros dos dois perfis persistem versões e data do servidor',async()=>{for(const u of [a,b]){const salvo=await Usuario.findByPk(u.id);expect(salvo.termos_uso_versao).toBe(documentos.versao_termos);expect(salvo.privacidade_versao).toBe(documentos.versao_privacidade);expect(salvo.documentos_aceitos_em).toBeInstanceOf(Date);}});
test.each(['solicitante','prestador'])('API %s recusa sinais JSON inválidos e versões ausentes/antigas sem cadastrar',async tipo=>{
 const email=`versao-invalida-${randomUUID()}@example.test`;
 const base={nome:'Pessoa fictícia',email,senha:'Privacidade123!',telefone:'11999999999',cpf:cpf(),cnpj_cpf:cpf(),categorias:['ELETRICA'],termo_lgpd_aceito:true,...aceite};
 for(const alteracao of [{termos_uso_aceitos:'true'},{privacidade_ciente:false},{termos_uso_versao:'antiga'},{privacidade_versao:null}]){
  const r=await request(app).post(`/api/v1/auth/register/${tipo}`).send({...base,...alteracao});
  if(r.body.data?.id) ids.push(r.body.data.id);
  expect(r.status).toBe(400);
 }
 expect(await Usuario.count({where:{email}})).toBe(0);
});
test.each(['solicitante','prestador'])('cadastro %s atual não exige o sinal genérico legado',async tipo=>{
 const resposta=await request(app).post(`/api/v1/auth/register/${tipo}`).send({nome:'Pessoa fictícia sem campo legado',email:`sem-legado-${randomUUID()}@example.test`,senha:'Privacidade123!',telefone:'11999999999',cpf:cpf(),cnpj_cpf:cpf(),categorias:['ELETRICA'],...aceite});
 if(resposta.body.data?.id)ids.push(resposta.body.data.id);
 expect(resposta.status).toBe(201);expect(resposta.body.data.termos_uso_versao).toBe(documentos.versao_termos);
});
test('metadados legados permanecem desconhecidos sem aceite retroativo',async()=>{await Usuario.update({termos_uso_versao:null,privacidade_versao:null,documentos_aceitos_em:null},{where:{id:b.id}});const r=await auth(request(app).get('/api/v1/privacidade/minha-central'),b).expect(200);expect(r.body.data.aceite).toEqual({termos_uso_versao:null,privacidade_versao:null,documentos_aceitos_em:null});});
test.each(['/api/v1/privacidade/minha-central','/api/v1/admin/privacidade'])('rotas protegidas sem JWT: %s',async rota=>{await request(app).get(rota).expect(401);});
test.each([{tipo:'OUTRO',descricao:'Texto suficientemente longo'},{tipo:'ACESSO',descricao:'curta'},{tipo:'ACESSO',descricao:{}},{tipo:'ACESSO',descricao:'a'.repeat(2001)}])('valida pedido antes de persistir: %j',async corpo=>{await auth(request(app).post('/api/v1/privacidade/solicitacoes')).send(corpo).expect(400);});
test('pedido é vinculado ao JWT, não ao usuario_id forjado, e outro titular não o vê',async()=>{const r=await auth(request(app).post('/api/v1/privacidade/solicitacoes')).send({tipo:'CORRECAO',descricao:'Descrição fictícia de pedido de correção.',usuario_id:b.id}).expect(201);expect(r.body.data.usuario_id).toBe(a.id);const outro=await auth(request(app).get('/api/v1/privacidade/minha-central'),b).expect(200);expect(outro.body.data.solicitacoes).toEqual([]);});
test('usuário comum não lista nem responde na administração',async()=>{await auth(request(app).get('/api/v1/admin/privacidade')).expect(403);await auth(request(app).patch(`/api/v1/admin/privacidade/${randomUUID()}/resposta`)).send({resposta:'Resposta não autorizada de teste.'}).expect(403);});
test('admin responde uma única vez e titular acompanha resposta sem expor dados de terceiros',async()=>{const criado=await pedido().expect(201);const id=criado.body.data.id;const r=await auth(request(app).get('/api/v1/admin/privacidade'),admin).expect(200);expect(r.body.data.find(p=>p.id===id).titular.email).toBe(a.email);expect(r.body.data.find(p=>p.id===id).titular).not.toHaveProperty('cpf');await auth(request(app).patch(`/api/v1/admin/privacidade/${id}/resposta`),admin).send({resposta:'Resposta fictícia após análise manual, sem excluir dados.'}).expect(200);const visto=await auth(request(app).get('/api/v1/privacidade/minha-central')).expect(200);expect(visto.body.data.solicitacoes.find(p=>p.id===id)).toMatchObject({status:'RESPONDIDA',respondida_por:admin.id});await auth(request(app).patch(`/api/v1/admin/privacidade/${id}/resposta`),admin).send({resposta:'Tentativa de sobrescrever resposta anterior.'}).expect(409);expect((await Usuario.findByPk(a.id)).ativo).toBe(true);});
test('resposta inválida ou protocolo ausente não muda registros',async()=>{await auth(request(app).patch(`/api/v1/admin/privacidade/${randomUUID()}/resposta`),admin).send({resposta:'Descrição longa de resposta válida.'}).expect(404);const r=await pedido().expect(201);await auth(request(app).patch(`/api/v1/admin/privacidade/${r.body.data.id}/resposta`),admin).send({resposta:{}}).expect(400);expect((await SolicitacaoPrivacidade.findByPk(r.body.data.id)).status).toBe('PENDENTE');});
test('respostas concorrentes não sobrescrevem a decisão registrada',async()=>{
 const criado=await pedido().expect(201);const id=criado.body.data.id;
 const responder=texto=>auth(request(app).patch(`/api/v1/admin/privacidade/${id}/resposta`),admin).send({resposta:texto});
 const rs=await Promise.all([responder('Primeira resposta fictícia para teste de concorrência.'),responder('Segunda resposta fictícia para teste de concorrência.')]);
 expect(rs.map(r=>r.status).sort()).toEqual([200,409]);
 const salva=await SolicitacaoPrivacidade.findByPk(id);expect(salva.resposta).toBe(rs.find(r=>r.status===200).body.data.resposta);
});
test('paginação administrativa retorna metadados e rejeita páginas inválidas',async()=>{
 const primeira=await auth(request(app).get('/api/v1/admin/privacidade?pagina=1'),admin).expect(200);
 expect(primeira.body.paginacao.pagina).toBe(1);expect(primeira.body.paginacao.total).toBeGreaterThan(0);
 const segunda=await auth(request(app).get('/api/v1/admin/privacidade?pagina=2'),admin).expect(200);
 expect(segunda.body.data).toEqual([]);
 for(const pagina of ['0','-1','1.5','invalida'])await auth(request(app).get(`/api/v1/admin/privacidade?pagina=${pagina}`),admin).expect(400);
});
test('limita a cinco pedidos pendentes sem depender da interface',async()=>{while(await SolicitacaoPrivacidade.count({where:{usuario_id:a.id,status:'PENDENTE'}})<5)await pedido().expect(201);await pedido().expect(409);expect(await SolicitacaoPrivacidade.count({where:{usuario_id:a.id,status:'PENDENTE'}})).toBe(5);});
