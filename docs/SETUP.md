# Chào Account — Hướng dẫn Setup

## Yêu cầu

- Node.js >= 18
- Docker (OrbStack hoặc Docker Desktop)
- pnpm hoặc npm

## Bước 1: Khởi động Database

```bash
cd account-chaomarket
docker compose up -d
```

Container `account-chaomarket-database` sẽ chạy PostgreSQL 16 trên port **5434**.

## Bước 2: Cấu hình .env

Copy `.env.example` → `.env` và điền các giá trị:

```bash
cp .env.example .env
```

> 💡 Các giá trị thật nằm trong `ops-vault/account-chaomarket/README.md`

## Bước 3: Push schema vào DB

```bash
npx drizzle-kit push
```

## Bước 4: Chạy dev server

```bash
npm run dev
# → http://localhost:3000
```

## Verify

```bash
# Check DB tables
docker exec account-chaomarket-database psql -U admin -d account_chaomarket -c "\dt"

# Check all routes
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auth/login
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/account/profile
```

## Lưu ý

- Dev server mặc định chạy port **3000** (trùng với ChaoMarket Web)
- Nếu cần chạy song song, đổi port trong `.env`: `NEXTAUTH_URL=http://localhost:3002`
- Google OAuth cần cấu hình redirect URI tại Google Cloud Console
