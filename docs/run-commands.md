# Run Commands

## Backend
npm install
npm run dev
npm start

## Frontend
npm install
npm run dev
npm run build

## Suggested future scripts
### Backend
- npm run lint
- npm run test
- npm run seed

### Frontend
- npm run lint
- npm run test

## Production-like run order
1) Backend first
```bash
cd backend
npm install
NODE_ENV=production ENFORCE_AUTH=true npm run start:prod
```
2) Frontend build and preview
```bash
cd fuel-frontend-v2
npm install
npm run build
npm run preview:host
```
3) Verify health
```bash
curl http://localhost:5000/api/health
```
