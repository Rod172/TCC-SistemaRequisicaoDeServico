/**
 * Ponto de Entrada (Entrypoint) do Servidor HTTP Backend
 * 
 * Bibliotecas de Terceiros Utilizadas:
 * - dotenv: Carrega as variáveis de ambiente antes de inicializar o servidor.
 *   Doc: https://github.com/motdotla/dotenv
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Servidor rodando na porta: ${PORT}`);
  console.log(`📚 Documentação Swagger disponível em: http://localhost:${PORT}/api-docs`);
  console.log(`🟢 Health Check disponível em: http://localhost:${PORT}/api/v1/health`);
  console.log(`==================================================`);
});
