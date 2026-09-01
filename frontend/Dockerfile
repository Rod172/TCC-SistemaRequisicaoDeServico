# Container de Desenvolvimento do Frontend (Next.js 14 + React + TypeScript)
FROM node:20-alpine

# Diretório de trabalho na imagem
WORKDIR /app

# Copiar os manifestos de dependência
COPY package*.json ./

# Instalar as dependências do Next.js
RUN npm install

# Copiar todo o código-fonte do frontend
COPY . .

# Expor a porta 3000 do Next.js
EXPOSE 3000

# Variável de ambiente para build/dev
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando padrão de inicialização do servidor de desenvolvimento Next.js
CMD ["npm", "run", "dev"]
