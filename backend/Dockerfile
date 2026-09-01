# Container de Desenvolvimento do Backend (Node.js + Express + TypeScript)
FROM node:20-alpine

# Diretório de trabalho na imagem
WORKDIR /app

# Copiar os manifestos de dependência
COPY package*.json ./

# Instalar as dependências do Node.js
RUN npm install

# Copiar todo o código-fonte do backend
COPY . .

# Expor a porta 3001 da API REST
EXPOSE 3001

# Comando padrão de inicialização do backend
CMD ["npm", "run", "dev"]
