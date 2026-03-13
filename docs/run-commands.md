# Run Commands

## Backend (Development)
```bash
cd backend
npm install
npm run check:env
npm run dev
```

## Frontend (Development)
```bash
cd fuel-frontend-v2
npm install
npm run dev
```

## Backend (Production-like local run)
```bash
cd backend
npm install
NODE_ENV=production ENFORCE_AUTH=true npm run start:prod
```

## Frontend (Production build + preview)
```bash
cd fuel-frontend-v2
npm install
npm run build
npm run preview:host
```

## Health check
```bash
cd backend
npm run healthcheck
```
