# Vôlei - Formador de Times

Aplicação web para formação e gerenciamento de times de vôlei.

## 🐳 Execução via Docker

O projeto está configurado para execução e deploy em contêineres Docker, seguindo as diretrizes descritas em `SERVER-ROLES.md`.

### Arquivos de Configuração Docker
- **`Dockerfile`**: Compilação multi-stage (build da aplicação Vite + bundler do servidor Node via esbuild, e execução com dependências de produção).
- **`docker-compose.yml`**: Configuração do serviço `volei-formador-de-times`, conectado à rede externa `nginx-proxy` e com volume de dados persistente `./data:/app/data`.
- **`.dockerignore`**: Exclui dependências locais, builds anteriores e segredos do contexto da imagem.

### Testar localmente com Docker

```bash
docker compose up -d --build
```

### 🚀 Deploy para o Servidor

Para realizar o deploy no servidor de aplicação:

```bash
./deploy.sh
```

O script `deploy.sh` fará a sincronização dos arquivos via `rsync` e executará o `docker compose up -d --build` remotamente no servidor.

### 🗄️ Gerenciamento do Banco de Dados em Produção

Para manipular os dados de produção de forma simples:

1. **Baixar o banco de dados de produção para o seu computador:**
   ```bash
   ./pull-db.sh
   ```
   *(Cria um backup local automaticamente e salva os dados de produção em `./data/db.json`)*.

2. **Editar o arquivo localmente:**
   - Abra o arquivo [data/db.json](file:///home/xcami/Volei---Formador-de-times/data/db.json) em qualquer editor de código.

3. **Enviar as alterações de volta para Produção:**
   ```bash
   ./push-db.sh
   ```
   *(Cria um backup de segurança no servidor remoto e reinicia o container para aplicar as mudanças)*.

