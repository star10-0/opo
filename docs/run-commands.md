# Run Commands

## Backend (Development)
```bash
cd backend
npm install
npm run dev
```

## Backend (Production-like)
```bash
cd backend
npm install
NODE_ENV=production ENFORCE_AUTH=true npm run start:prod
```

## Backend health check
```bash
cd backend
npm run healthcheck
```


## Backend auth demo users bootstrap
```bash
cd backend
JWT_SECRET=replace-me npm run bootstrap:auth-demo-users
```

## Frontend (Development)
```bash
cd fuel-frontend-v2
npm install
npm run dev
```

## Frontend (Production build)
```bash
cd fuel-frontend-v2
npm install
npm run build
npm run preview:host
```

## Notes
- لا ترفع ملف `.env` إلى git.
- راجع `.env.example` قبل التشغيل الأول.
- راجع `docs/deployment-handoff.md` لتسليم وتشغيل الإنتاج.
