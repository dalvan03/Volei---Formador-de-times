# CHANGELOG:

--- VERSION 1.0.4 --- 
Atualizado guia de deploy para remover uso de `sudo` (recomendado adicionar usuário ao grupo docker) e script de deploy mais robusto.

--- VERSION 1.0.3 ---
Adicionado Redis como serviço global compartilhado e guia de uso para projetos.

--- VERSION 1.0.2 ---
Adicionado Faster Whisper como serviço global independente (compose dedicado e deploy via `deploy_fwhisper.sh`).
Documentação atualizada para fluxo de deploy independente em `docs/faster-whisper-service.md`.

--- VERSION 1.0.1 ---
Adicionado suporte para múltiplas versões de Python.
Novo Tutorial - Agendamentos de Scripts com Supercronic.

--- VERSION 1.0.0 ---
Primeira versão do servidor de aplicações.



# 📘 Guia do Servidor de Aplicações

**Hostname/IP:** srv556787 / 85.209.93.46

Bem-vindo(a) ao nosso servidor de desenvolvimento e produção. Este documento detalha a arquitetura, as regras e os procedimentos para fazer deploy e gerenciar aplicações. É fundamental que todos os desenvolvedores leiam e sigam estas diretrizes.

## 📋 Índice

- [🏛️ Filosofia Principal: Tudo como Contêiner](#️-filosofia-principal-tudo-como-contêiner)
- [📁 Estrutura de Diretórios](#-estrutura-de-diretórios)
- [🛠️ Serviços Globais Instalados](#️-serviços-globais-instalados)
- [🚀 Como Fazer Deploy de uma Nova Aplicação](#-como-fazer-deploy-de-uma-nova-aplicação-passo-a-passo)
- [✅ Boas Práticas e Regras](#-boas-práticas-e-regras)
- [💡 Comandos Úteis](#-comandos-úteis)

## 🏛️ Filosofia Principal: Tudo como Contêiner

A regra de ouro deste servidor é: **nenhum serviço ou aplicação deve ser instalado diretamente no sistema operacional do host**. Tudo, sem exceção, deve rodar dentro de contêineres Docker gerenciados pelo Docker Compose.

Isso garante:

- **Isolamento:** As dependências de um projeto não afetam os outros.
- **Reprodutibilidade:** O ambiente pode ser recriado facilmente em qualquer lugar.
- **Segurança:** Reduz a superfície de ataque ao sistema host.
- **Organização:** Facilita o gerenciamento, atualização e remoção de serviços.

## 📁 Estrutura de Diretórios

Toda a nossa operação está centralizada no diretório home do usuário `xdmt`. A estrutura é a seguinte:

```
/home/xdmt/
├── docker-services/
│   └── nginx-proxy-manager/
│       ├── data/
│       ├── letsencrypt/
│       └── docker-compose.yml
│   └── (outros serviços globais como bancos de dados, etc.)
│
└── projects/
    ├── painting-widget/
    │   ├── Dockerfile
    │   └── docker-compose.yml
    │
    └── nome-do-projeto-2/
        ├── Dockerfile
        └── docker-compose.yml
```

### Descrição dos Diretórios

- **`/docker-services`**: Para serviços de infraestrutura que são compartilhados entre múltiplos projetos (ex: o proxy reverso, bancos de dados, etc.). São serviços "stateful", que persistem dados.
- **`/projects`**: Para as aplicações individuais. Cada subpasta representa um projeto e deve conter seu próprio `Dockerfile` e `docker-compose.yml`. Idealmente, as aplicações aqui são "stateless".


## 🚀 Como Fazer Deploy de uma Nova Aplicação (Passo a Passo !IMPORTANTE)

Siga este procedimento para qualquer novo projeto web:

### 1. Preparação Local

No repositório do seu projeto, crie dois arquivos essenciais:

- **`Dockerfile`**: Com as instruções para construir a imagem da sua aplicação.
- **`docker-compose.yml`**: Para definir o serviço da sua aplicação. Use este template:

```yaml
services:
  # Use um nome único para o serviço, ex: 'meu-app-web'
  nome-unico-do-servico:
    build: .
    # O container_name é o nome que você usará no Nginx Proxy Manager.
    container_name: nome-do-projeto
    restart: unless-stopped
    networks:
      # Essencial para que o NPM encontre seu container.
      - nginx-proxy-network

networks:
  nginx-proxy-network:
    # Diz ao Docker para usar a rede que já foi criada pelo NPM.
    external: true
    name: nginx-proxy
```

### 2. Criar a Pasta no Servidor

Crie uma nova pasta para o seu projeto dentro de `/home/xdmt/projects/`:

```bash
mkdir /home/xdmt/projects/nome-do-projeto
```

### 3. Fazer o Deploy

Use um script `deploy.sh` para automatizar o envio dos arquivos e a inicialização do container. O script deve:

1. Sincronizar os arquivos locais (incluindo `Dockerfile` e `docker-compose.yml`) para a pasta do projeto no servidor via `rsync`.
2. Executar o comando `docker-compose up -d --build` remotamente via `ssh` na pasta do projeto.

INFOS: 
- Server ssh xdmt@85.209.93.46
- Crie de uma forma que o script `deploy.sh` sómente exija uma fez a senha do servidor.

#### Limpeza do Docker antes de iniciar o container (recomendado)

Antes de iniciar o container Docker, execute uma limpeza para evitar o acúmulo de imagens órfãs:

```bash
# Recomendado rodar sem sudo (se o usuário estiver no grupo docker)
docker image prune -f
```

> [!IMPORTANT]
> Evite usar `docker system prune -a` em scripts automatizados, pois ele remove imagens que podem ser necessárias para outros serviços se não estiverem em execução no momento. Use `docker image prune -f` para remover apenas as imagens "dangling" (sem tag).

#### Permissões Docker (Removendo a necessidade de sudo)

Para que os scripts de deploy funcionem sem pedir senha do `sudo`, o usuário do servidor (`xdmt`) deve fazer parte do grupo `docker`. 

```bash
# Execute uma única vez no servidor como root ou com sudo
sudo usermod -aG docker xdmt
# É necessário deslogar e logar novamente para aplicar as mudanças
```

#### Autenticação SSH (Senha apenas na primeira requisição)

Para evitar múltiplos prompts de senha durante o deploy, utilize **SSH multiplexing** no script de deploy. Isso cria uma conexão mestre persistente que é reutilizada por todos os comandos `ssh` e `rsync` da mesma sessão.

Exemplo a ser aplicado nos scripts:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Parâmetros de SSH (conexão persistente por 10 minutos)
CONTROL_PATH="${HOME}/.ssh/cm_${REMOTE_USER}_${REMOTE_HOST}_22"
SSH_OPTS="-o ControlMaster=auto -o ControlPersist=600 -o ControlPath=${CONTROL_PATH}"

# Inicializa (ou reutiliza) a conexão mestre
mkdir -p "${HOME}/.ssh"
ssh -O check ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} >/dev/null 2>&1 || \
  ssh ${SSH_OPTS} -f -N ${REMOTE_USER}@${REMOTE_HOST}

# Usar a conexão persistente em todos os comandos
echo "[deploy] Sincronizando arquivos..."
rsync -avz -e "ssh ${SSH_OPTS}" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  ./ ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_PATH}/"

echo "[deploy] Executando comandos remotos..."
ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} '
  set -euo pipefail
  cd '"${REMOTE_PATH}"'
  
  # Limpeza de imagens órfãs
  docker image prune -f
  
  # Detecta Compose (V2 pref. over V1)
  if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
  else
    COMPOSE_CMD="docker-compose"
  fi
  
  $COMPOSE_CMD down || true
  $COMPOSE_CMD build --no-cache
  $COMPOSE_CMD up -d
'
```

Observações:
- Com multiplexing ativo, a senha é solicitada apenas na primeira conexão da sessão.
- Para zero prompts, configure chave pública com `ssh-keygen` e `ssh-copy-id`.
- Mantenha o deploy sempre via `ssh`/`rsync`; não instale serviços direto no host.

### 4. Configurar o Proxy Reverso (NPM)

1. Acesse o painel do Nginx Proxy Manager: [http://85.209.93.46:81](http://85.209.93.46:81) ou [http://nginx.anyco.com.br:81](http://nginx.anyco.com.br:81).
2. Vá em **Hosts > Proxy Hosts** e clique em **Add Proxy Host**.

#### Details Tab:

- **Domain Names**: Coloque o domínio que apontará para a aplicação (ex: `<dominio>.anyco.com.br`).
- **Scheme**: `http`.
- **Forward Hostname / IP**: Coloque o `container_name` que você definiu no seu `docker-compose.yml` (ex: `nome-do-projeto`).
- **Forward Port**: Coloque a porta que sua aplicação expõe DENTRO do container (ex: `3000` para Next.js, `80` para Apache, etc).

#### SSL Tab:

- **SSL Certificate**: Selecione "Request a new SSL Certificate".
- Ative "Force SSL" e "HTTP/2 Support".
- Concorde com os termos e clique em **Save**.

Após alguns instantes, o NPM irá gerar o certificado e seu site estará no ar com HTTPS.

## ✅ Boas Práticas e Regras

1. **NÃO exponha portas publicamente** no `docker-compose.yml` de uma aplicação (ex: `- "8080:3000"`). O Nginx Proxy Manager é o único que deve expor as portas 80 e 443.

2. **Gerencie segredos e variáveis de ambiente** usando arquivos `.env`. Nunca coloque senhas ou chaves de API diretamente no `Dockerfile` ou `docker-compose.yml`.

3. **Mantenha o servidor limpo**. Periodicamente, rode `docker image prune -f` para remover imagens Docker antigas e não utilizadas.

## 💡 Comandos Úteis

```bash
# Listar todos os containers (em execução e parados)
docker ps -a

# Ver os logs de um container em tempo real
# (execute dentro da pasta do projeto)
docker-compose logs -f

# Ver o uso de recursos (CPU, Memória) dos containers
docker stats

# Forçar a parada e remoção de todos os containers de um projeto
# (execute dentro da pasta do projeto)
docker-compose down

# Limpar imagens Docker que não estão em uso
docker image prune -f
```

---

**📝 Nota**: Este documento deve ser mantido atualizado conforme novas práticas e serviços são adicionados ao servidor. Abaixo, algumas dessas atualizações:

## ⏰ Agendamentos com Supercronic (Jobs Recorrentes)

Para rodar scripts em horários fixos, preferimos agendar dentro de um container usando `supercronic` (cron-friendly para Docker). Isso mantém o host limpo e segue a filosofia “tudo como contêiner”.

- Estrutura básica do serviço:
  - `Dockerfile`: instala Python, define `TZ=America/Sao_Paulo` e baixa o binário do `supercronic`.
  - `crontab`: arquivo com as linhas de cron dos jobs (ex.: diário à meia-noite e semanal às 03:00).
  - `docker-compose.yml`: monta um volume para logs (`./files/cron-logs:/var/log/cron`) e carrega `.env` para segredos/variáveis.
  - Logs: enviados para `/var/log/cron` e para `stdout` do container (`docker-compose logs -f`).

- Padrões recomendados nos comandos da crontab:
  - Use `bash -lc` para permitir `source /app/.env` e variáveis inline.
  - Nunca exponha portas: jobs não são serviços web.
  - Encadeie etapas com um runner (ex.: `scripts/cron_runner.sh`) para registrar início/fim, `rc` e duração.

- Exemplo de linhas (dentro do container):
  - Heartbeat por minuto: `* * * * * echo "[heartbeat] $(date -Is)" >> /var/log/cron/heartbeat.log 2>&1`
  - Diário 00:00: encadeia `02a → 03a → 04a` e grava em `daily_02a_03a_04a_<YYYY-MM-DD>.log`.
  - Semanal segunda 03:00: encadeia `00 → 01` e grava em `weekly_00_01_<YYYY-MM-DD>.log`.

- Deploy típico:
  - Sincronizar arquivos com `rsync` via script (`deploy.sh`).
  - Subir com `docker-compose up -d --build` dentro da pasta do projeto.
  - Validar com `docker-compose logs -f` e checar `files/cron-logs/` no host.

Este padrão já está aplicado ao projeto do scraper, (`leilao-scraper-scheduler`). Para mais informações, pergunte. 

## 🛠️ Serviços Globais Instalados

### 1. Docker e Docker Compose

A base de toda a nossa infraestrutura. Gerencia todos os contêineres.

### 2. Nginx Proxy Manager (NPM)

É o nosso **gateway de entrada** para todas as aplicações web.

- **Função**: Atua como um proxy reverso, direcionando o tráfego de um domínio (ex: `exemplo.anyco.com.br`) para o contêiner Docker correspondente. Também gerencia automaticamente os certificados SSL/TLS (HTTPS) com Let's Encrypt.
- **Acesso ao Painel**: [http://85.209.93.46:81](http://85.209.93.46:81)
- **Rede Docker**: `nginx-proxy` (todas as aplicações web DEVEM se conectar a esta rede).

### 3. Faster Whisper (Serviço Global de Transcrição)

- **Função**: serviço HTTP de transcrição de áudio baseado em `faster-whisper`.
- **Container**: `fasterwhisper-service` (rede `nginx-proxy`).
- **Diretório (global)**: `/home/xdmt/docker-services/faster-whisper/` (compose em `fasterwhisper_service/docker-compose.yml`).
- **Porta interna**: `9010` (não expor; publicar via NPM).
- **Endpoints**: `GET /healthz`, `POST /transcribe` (multipart/form-data).
- **Autenticação**: cabeçalho `X-API-KEY` com valor de `WHISPER_API_KEY`.
- **Variáveis essenciais**: `WHISPER_API_KEY`, `FASTER_WHISPER_API_URL`, `FASTER_WHISPER_MODEL_NAME`, `FASTER_WHISPER_DEVICE`, `FASTER_WHISPER_COMPUTE_TYPE`.
- **Deploy dedicado**: usar script `deploy_fwhisper.sh` com `REMOTE_PATH="/home/xdmt/docker-services/faster-whisper"`.
- **Publicação (NPM)**: criar host `whisperfw.<domínio>` apontando para `fasterwhisper-service:9010` com SSL.

### 4. Redis (Serviço Global de Cache/Chave-Valor)

- **Função**: cache compartilhado e armazenamento chave-valor para múltiplas aplicações.
- **Container**: `redis` (imagem `bitnami/redis:latest`).
- **Diretório (global)**: `/home/xdmt/docker-services/redis/` (compose dedicado).
- **Rede Docker**: `nginx-proxy` (não expor porta publicamente).
- **Porta interna**: `6379` (apenas interna na rede Docker).
- **Persistência**: volume `./data:/bitnami/redis/data` (appendonly ativado).
- **Variáveis essenciais (compose)**:
  - `REDIS_PASSWORD` (obrigatória; setada via `.env`).
  - `ALLOW_EMPTY_PASSWORD=no`.
  - `REDIS_EXTRA_FLAGS=--appendonly yes --requirepass ${REDIS_PASSWORD}` (ativa `AOF` e `requirepass`).

#### Como um projeto usa o Redis

Para aplicações que rodam na mesma rede Docker (`nginx-proxy`):

- Conecte seu serviço à rede externa `nginx-proxy` no `docker-compose.yml` do projeto.
- No `.env.production` do projeto, defina:

```
REDIS_URL=redis://:<SENHA>@redis:6379
```

- O hostname `redis` é resolvido internamente pela rede Docker; não exponha portas.
- Em projetos Next.js desta organização, o utilitário `src/lib/cache.ts` já suporta Redis via `ioredis` quando `REDIS_URL` está definido. Há também fallback para memória e suporte opcional a Upstash REST.
- Em desenvolvimento, a flag `USE_REDIS_ONLY` controla o modo de leitura:
  - `USE_REDIS_ONLY=false` (recomendado no dev): modo híbrido, recalcula e popula o cache quando necessário.
  - `USE_REDIS_ONLY=true`: leitura apenas do cache (útil para validar a infraestrutura quando as chaves já estão quentes).

#### Acesso local via túnel SSH (desenvolvimento)

Para usar o Redis do servidor a partir do seu ambiente local sem expor portas públicas:

1. Descubra o IP do container Redis no servidor:

```
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis
```

Exemplo: `172.20.0.9`.

2. Crie o túnel SSH no seu computador local, apontando para a porta interna `6379` do container:

```
# Se 6379 já estiver ocupado localmente, use 6380 (ou outra porta livre)
ssh -o ExitOnForwardFailure=yes -N -L 6380:172.20.0.9:6379 xdmt@85.209.93.46
```

3. Configure seu `.env.local` (ou `.env` usado no dev) no projeto local:

```
REDIS_URL=redis://:<SENHA>@localhost:6380
USE_REDIS_ONLY=false
```

Observações:
- Não use aspas na senha dentro da URI (`redis://:<senha>@host:port`).
- Reinicie o `npm run dev` após mudar variáveis de ambiente para que o Next.js recarregue.
- Valide no app local (porta 9002): `curl -sS http://localhost:9002/api/redis/health` → deve mostrar `client=ioredis` e `status=ready`.

#### Boas práticas e segurança

- Não exponha a porta `6379` publicamente; acesso sempre interno via rede Docker ou túnel SSH.
- Com `requirepass` ativo, não é necessário usuário ACL; mantenha o formato `redis://:<senha>@...`.
- Armazene segredos apenas em `.env`/secrets; nunca commitar senhas.
- Mantenha `appendonly` ligado para durabilidade; monitore o volume de dados em `/home/xdmt/docker-services/redis/data`.

#### Operação e saúde

- Ver logs do container: `docker logs -f redis`.
- Testar saúde no servidor: `docker exec redis redis-cli -a <SENHA> ping` (esperado `PONG`).
- Ver IP interno do container: `docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis`.
- Em aplicações Next.js, existe o endpoint `GET /api/redis/health` para validar conectividade e existência de chaves de cache.

#### Troubleshooting

- "Address already in use" ao criar túnel local:
  - Use outra porta local (ex.: `6380`) ou finalize o processo que ocupa `6379` (`ss -lptn | grep :6379`).
- Health mostra `cliente indisponível ou conectando`:
  - Verifique o formato do `REDIS_URL` (sem aspas na senha), túnel ativo e reinicie o dev server.
- Chaves de cache ausentes com `USE_REDIS_ONLY=true`:
  - Use `USE_REDIS_ONLY=false` para modo híbrido e chame os endpoints relevantes duas vezes para popular o cache.

### 5. DOCX→PDF (uso rápido)


#### Publicação (NPM)

- Host → `docx-pdf-service:5000` (rede `nginx-proxy`).

#### Chamada

```bash
curl -f -X POST -F file=@arquivo.docx http://docx-pdf-service:5000/convert > saida.pdf
# ou via domínio NPM
curl -f -X POST -F file=@arquivo.docx https://pdf.seu-dominio/convert > saida.pdf
```

#### Saúde

```bash
ssh xdmt@85.209.93.46 "docker exec docx-pdf-service python -c 'import urllib.request as u; print(u.urlopen(\"http://localhost:5000/healthz\").read().decode())'"
```

- Cliente Gotenberg: `app/pdf_client.py` (GOTENBERG_URL e chamada HTTP).
- Endpoints do serviço: `app/server.py` (`GET /healthz`, `POST /convert`).
