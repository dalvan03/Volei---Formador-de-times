#!/usr/bin/env bash
set -euo pipefail

# Configurações do servidor e projeto
REMOTE_USER="xdmt"
REMOTE_HOST="85.209.93.46"
PROJECT_NAME="volei-formador-de-times"
REMOTE_PATH="/home/${REMOTE_USER}/projects/${PROJECT_NAME}"

# Parâmetros de SSH Multiplexing (pede senha apenas 1 vez por sessão)
CONTROL_PATH="${HOME}/.ssh/cm_${REMOTE_USER}_${REMOTE_HOST}_22"
SSH_OPTS="-o ControlMaster=auto -o ControlPersist=600 -o ControlPath=${CONTROL_PATH}"

echo "=================================================="
echo "🚀 Iniciando Deploy de ${PROJECT_NAME}..."
echo "=================================================="

# Garante que o diretório ~/.ssh exista localmente
mkdir -p "${HOME}/.ssh"

# Inicializa ou reutiliza a conexão mestre SSH
ssh -O check ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} >/dev/null 2>&1 || \
  ssh ${SSH_OPTS} -f -N ${REMOTE_USER}@${REMOTE_HOST}

# Garante que a pasta do projeto existe no servidor remoto
echo "[1/3] Garantindo estrutura de diretórios no servidor..."
ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p '${REMOTE_PATH}'"

# Sincroniza os arquivos via rsync utilizando a conexão mestre
echo "[2/3] Sincronizando arquivos locais para o servidor..."
rsync -avz -e "ssh ${SSH_OPTS}" \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'data/' \
  ./ ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_PATH}/"

# Executa o build e subida do container remotamente
echo "[3/3] Executando build e subindo contêiner Docker..."
ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} '
  set -euo pipefail
  cd '"${REMOTE_PATH}"'
  
  # Limpeza de imagens dangling
  docker image prune -f
  
  # Detecta o comando Compose disponível (V2 ou V1)
  if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
  else
    COMPOSE_CMD="docker-compose"
  fi
  
  $COMPOSE_CMD down || true
  $COMPOSE_CMD build --no-cache
  $COMPOSE_CMD up -d
'

echo "=================================================="
echo "✅ Deploy concluído com sucesso!"
echo "📌 Lembre-se de configurar o Nginx Proxy Manager (NPM):"
echo "   - Container Name / Forward Host: ${PROJECT_NAME}"
echo "   - Forward Port: 3000"
echo "=================================================="
