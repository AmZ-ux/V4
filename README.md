# Van Ease Pay V3

Aplicativo web para gestao de transporte escolar com:
- portal admin (passageiros, pagamentos, comprovantes, configuracoes)
- portal passageiro (status mensalidade, PIX e envio de comprovante)
- API backend com autenticacao JWT e banco SQLite

## Arquitetura

- Frontend: React + Vite + Zustand (`/src`)
- Backend: Express + SQLite (`/backend`)
- Uploads de comprovantes: `backend/uploads`
- Banco: `backend/data/app.db`

## Requisitos

- Node.js 20+
- npm 10+

## Instalacao

### 1) Frontend (raiz)

```bash
npm install
```

### 2) Backend

```bash
cd backend
npm install
cd ..
```

## Rodando localmente

### Opcao recomendada (frontend + backend juntos)

```bash
npm run dev:all
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

### Opcao separada

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run dev:api
```

## Variaveis de ambiente

Frontend (`.env` na raiz):

```env
VITE_API_URL=http://localhost:4000
```

Backend (`backend/.env` opcional):

```env
PORT=4000
JWT_SECRET=troque-esta-chave-em-producao
CORS_ORIGINS=http://localhost:5173,https://seu-frontend.vercel.app
```

## Contas iniciais (seed)

- Admin: `admin@minhavan.com` / `123456`
- Passageiro: `ana@ifpi.com` / `123456`

## Scripts

### Raiz

- `npm run dev` -> frontend
- `npm run dev:api` -> backend
- `npm run dev:all` -> frontend + backend
- `npm run build` -> build frontend
- `npm run preview` -> preview frontend
- `npm run backup:db` -> backup do SQLite

### Backend

- `npm run dev` -> API com watch
- `npm run start` -> API sem watch
- `npm run backup` -> cria backup em `backend/data/backups`

## Endpoints principais

- `POST /auth/login`
- `POST /auth/register`
- `GET /bootstrap`
- `POST /payments/mark-paid`
- `POST /passenger/receipt`
- `GET /receipts/pending`
- `PATCH /receipts/:paymentId/status`
- `GET/PUT /settings`

## Hardening ja aplicado

- Validacao de payload com `zod`
- Middleware de autenticacao JWT
- Controle de role (`admin` / `passenger`)
- Rate limit basico em login, cadastro e upload de comprovante
- Log de requisicoes com tempo de resposta
- Backup de banco por script

## Producao inicial (checklist)

1. Configurar `JWT_SECRET` forte no backend.
2. Rodar backend atras de proxy (Nginx/Caddy) com HTTPS.
3. Agendar `npm run backup:db` (cron/Task Scheduler).
4. Proteger pasta de uploads e definir politica de retencao.
5. Revisar CORS para dominio real do frontend.

## Observacoes

- O backend usa SQLite para simplicidade e velocidade de setup.
- Para escala maior, migrar para Postgres mantendo o mesmo contrato de API.
