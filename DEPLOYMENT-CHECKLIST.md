# Quick Deployment Checklist ✅

## Before Deploying

- [ ] Update backend `.env` file:
  - [ ] Set `NODE_ENV=production`
  - [ ] Set `API_URL=https://api.icsrt.cloud`
  - [ ] Set `CORS_ORIGINS=https://icsrt.cloud,https://www.icsrt.cloud,https://admin.icsrt.cloud,https://api.icsrt.cloud`
  - [ ] Set production MongoDB URI
  - [ ] Add email credentials
  - [ ] Add Paymob IFRAME_ID and HMAC_SECRET

- [ ] Update frontend `.env` file:
  - [ ] Set `REACT_APP_API_BASE_URL=https://api.icsrt.cloud`

- [ ] Build frontend:
  ```bash
  cd icsrt-userpage
  npm run build
  ```

## After Deploying

- [ ] Backend is running on api.icsrt.cloud
- [ ] Frontend is uploaded to icsrt.cloud
- [ ] Test API health: `https://api.icsrt.cloud/api/health`
- [ ] Test frontend loads: `https://icsrt.cloud`
- [ ] Test login works
- [ ] Check browser console for API URL (should show https://api.icsrt.cloud)
- [ ] No CORS errors in console

## Common Issues

### Frontend can't connect to backend
**Fix**: Check REACT_APP_API_BASE_URL in frontend .env matches your backend URL

### CORS errors
**Fix**: Check CORS_ORIGINS in backend .env includes your frontend domain

### 404 on page refresh
**Fix**: Configure .htaccess or nginx for SPA routing (see DEPLOYMENT-GUIDE.md)

### File uploads fail
**Fix**: Create and chmod 755 the uploads folder

---

**Pro Tip**: The system auto-detects the domain! If you deploy correctly, it will automatically use:
- `https://api.icsrt.cloud` when on icsrt.cloud
- `http://localhost:3000` when on localhost

Check browser console to see which API URL is being used!
