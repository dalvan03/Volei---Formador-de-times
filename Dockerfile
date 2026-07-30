# Use uma imagem leve do Node.js baseada em Alpine
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json bun.lock* ./

# Instala as dependências
RUN npm ci || npm install

# Copia o restante do código da aplicação
COPY . .

# Executa a compilação do Vite (saída em /app/dist)
RUN npm run build

# Estágio de execução com Nginx para servir o build estático
FROM nginx:alpine

# Copia os arquivos estáticos compilados para a pasta do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta interna 80 do container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
