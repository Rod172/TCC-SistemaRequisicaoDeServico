/** Isola o ambiente antes de importar app/Sequelize. Usa APIs nativas do Node.js. */
function configurarAmbiente() {
 const banco = process.env.DB_NAME_TEST;
 if (!banco || !/^[a-zA-Z0-9_]+_test$/.test(banco)) {
  throw new Error('Defina explicitamente DB_NAME_TEST=tcc_servico_facil_test; somente nomes com sufixo _test são permitidos.');
 }
 process.env.NODE_ENV = 'test';
 process.env.DB_NAME = banco;
 process.env.DB_HOST = process.env.DB_HOST_TEST || '127.0.0.1';
 process.env.DB_PORT = process.env.DB_PORT_TEST || '3306';
 process.env.DB_USER = process.env.DB_USER_TEST || 'root';
 process.env.DB_PASSWORD = process.env.DB_PASSWORD_TEST ?? 'root';
 process.env.JWT_SECRET = 'chave-exclusiva-integracao-us26-sem-uso-em-producao';
 process.env.JWT_EXPIRES_IN = '1h';
 return banco;
}
module.exports = configurarAmbiente;
configurarAmbiente();
