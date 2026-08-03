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
