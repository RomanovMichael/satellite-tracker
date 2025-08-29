# Starlink Tracker (regenerated, patched)

## Backend
```bash
cd backend
npm i
npm run dev
# check: http://localhost:3001/api/health -> {"ok":true}
```

## Frontend
```bash
cd frontend
npm i
npm run dev
# open http://localhost:5173
```

Notes:
- Data folder is `backend/data` (auto-created).
- Map animation starts after map 'load' to avoid race conditions.
- No @types/mapbox__point-geometry needed.
