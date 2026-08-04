<div align="center">
  <img src="favicon.png" alt="Culto de Segunda Logo" width="100" height="100" style="border-radius: 24px;" />

  # 🏐 Culto de Segunda — Formador de Times de Vôlei

  <p align="center">
    <strong>Sistema web moderno, inteligente e ágil para sorteio equilibrado de times de vôlei, gestão de partidas e ranking estatístico de jogadores.</strong>
  </p>

  <p align="center">
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-arquitetura">Arquitetura</a> •
    <a href="#-execução-com-docker">Docker</a> •
    <a href="#-deploy--banco-de-dados">Deploy & DB</a> •
    <a href="#-licença">Licença</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

---

## 🌟 Sobre o Projeto

O **Culto de Segunda** foi desenvolvido para resolver o desafio semanal de organizar partidas de vôlei recreativo e competitivo. Esqueça a bagunça de listas em grupos de mensagem ou sorteios injustos: nossa aplicação calcula o nível dos jogadores, considera posições em quadra (Levantador, Ponteiro, Central, Oposto, Líbero) e gera **confrontos totalmente equilibrados e dinâmicos**.

Além do sorteio inteligente, a aplicação conta com registro de placares em tempo real, ranking estatístico por estrelas, histórico de rodadas e geração de cards visuais para compartilhamento direto no WhatsApp e redes sociais.

---

## ✨ Funcionalidades

### ⚡ Algoritmo de Sorteio Inteligente
- **Algoritmo de Troca Gulosa (Greedy Swap)**: Avalia a pontuação (`rating`) de cada jogador para que a diferença média entre os dois times seja mínima.
- **Distribuição de Posições**: Garante a alocação proporcional de Levantadores e atacantes entre os dois lados da quadra.
- **Tratamento de Ímpares**: Caso haja um número ímpar de participantes, o sistema realiza o balanceamento sem penalizar a média do time com jogadores excedentes.

### 📊 Gestão do Dia de Jogo & Placares
- Marcador de placar por sets (ex: 25x23) e vitórias acumuladas.
- Registro da presença de atletas da rodada com suporte a convidados.
- Histórico completo das rodadas com estatísticas individuais de vitórias, derrotas e taxa de aproveitamento.

### 🌟 Ranking & Sistema de Feedback Coletivo
- **Estrelas Dinâmicas**: Avaliação de 1 a 5 estrelas atribuída aos atletas após os jogos.
- **Feedback de Equilíbrio**: Jogadores votam ao final da rodada se o confronto esteve realmente parelho.

### 📸 Geração de Cards para Redes Sociais
- Geração automática de imagem PNG estilizada em *Dark Mode / Glassmorphism* com escalação oficial dos dois times para envio nos grupos de WhatsApp.

---

## 🛠️ Tecnologias

O projeto utiliza uma stack moderna focada em alta performance, responsividade e facilidade de deploy:

- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (Ícones).
- **Build Tool**: [Vite](https://vitejs.dev/) & [esbuild](https://esbuild.github.io/).
- **Backend / API**: Server HTTP lightweight com [Express](https://expressjs.com/) em Node.js (com persistência JSON rápida).
- **Utilitários**: [html-to-image](https://github.com/bubkoo/html-to-image) para renderização de cards.
- **Infraestrutura**: Containerização multi-stage via **Docker** e **Docker Compose**, integrada com **Nginx Proxy Manager**.

---

## 🏗️ Arquitetura do Projeto

```text
├── data/                  # Persistência de dados (db.json)
├── dist/                  # Build compilado de produção (Frontend SPA + Backend CJS)
├── scripts/               # Scripts automatizados de gestão de banco de dados
│   ├── baixar-db.sh       # Pull de segurança do banco de dados em Produção
│   └── subir-db.sh        # Push e deploy do banco de dados atualizado
├── src/
│   ├── components/        # Componentes React (GameDayTab, RankingTab, ShareTeamsModal...)
│   ├── types.ts           # Interfaces TypeScript da aplicação
│   ├── utils/             # Algoritmo de sorteio de times e persistência
│   ├── App.tsx            # Componente raiz da aplicação
│   └── main.tsx           # Entry point do React
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Orquestração do container de produção
├── deploy.sh              # Script automatizado de deploy SSH/rsync
└── server.ts              # Servidor Express de API e assets estáticos
```

---

## 🚀 Execução Local

### Pré-requisitos
- Node.js (v18+) ou Bun
- Docker e Docker Compose (opcional)

### Rodando via Node.js
```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o ambiente de desenvolvimento (Vite + Express Server)
npm run dev
```
Acesse a aplicação em `http://localhost:3000`.

### Rodando via Docker
```bash
# Compilar e subir o container localmente
docker compose up -d --build
```

---

## 🚢 Deploy & Gerenciamento de Produção

### Deploy Automatizado
O projeto possui um script de deploy em 1 comando que sincroniza os arquivos via `rsync`, recompila a imagem no servidor e reinicia o serviço sem downtime perceptível:

```bash
./deploy.sh
```

### 🗄️ Gerenciamento do Banco de Dados em Produção

Para editar dados dos jogadores ou histórico sem precisar mexer em SSH ou banco de dados manual:

1. **Baixar banco de produção para o seu computador:**
   ```bash
   ./scripts/baixar-db.sh
   ```
   *Baixa a versão atual em `./data/db.json` e cria um backup local.*

2. **Editar os dados localmente:**
   Abra e modifique o arquivo `data/db.json`.

3. **Subir alterações para o servidor:**
   ```bash
   ./scripts/subir-db.sh
   ```
   *Cria backup de segurança no servidor remoto, atualiza o arquivo e reinicia a aplicação.*

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para contribuir, clonar e dar uma ⭐️ no repositório!

---

<div align="center">
  Feito com ❤️ e 🏐 para a comunidade do <strong>Culto de Segunda</strong>
</div>
