# Deployment Guide

Deploy the **backend** to Render and the **frontend** to Vercel.

## Prerequisites

- GitHub repository pushed (Phase 12)
- MongoDB Atlas cluster (Network Access: `0.0.0.0/0` for Render)
- Cloudinary, Resend credentials (optional but recommended)

---

## Step 1 — Deploy Backend (Render)

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect your `society-maintenance-tracker` repository.
4. If using Blueprint, Render reads `render.yaml` automatically.
5. If creating manually:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. Add environment variables in Render dashboard:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `EMAIL_API_KEY` | From Resend dashboard |
| `EMAIL_FROM` | `Society Tracker <onboarding@resend.dev>` |
| `OVERDUE_DAYS` | `3` |
| `FRONTEND_URL` | _Set after Vercel deploy (Step 2)_ |

7. Deploy and copy your backend URL, e.g.:
   ```
   https://society-maintenance-api.onrender.com
   ```

8. Verify: open `https://YOUR-API-URL.onrender.com/api/health`

9. Seed admin (one time) — in Render **Shell** tab:
   ```bash
   npm run seed:admin
   ```

---

## Step 2 — Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New** → **Project**.
3. Import your `society-maintenance-tracker` repository.
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Add environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://society-maintenance-api.onrender.com` |

6. Deploy and copy your frontend URL, e.g.:
   ```
   https://society-maintenance-tracker.vercel.app
   ```

7. Verify: the landing page should show **API Status: ok** and **MongoDB: connected**.

---

## Step 3 — Link Frontend & Backend

1. Go back to **Render** → your backend service → **Environment**.
2. Set `FRONTEND_URL` to your Vercel URL:
   ```
   https://society-maintenance-tracker.vercel.app
   ```
3. Save and redeploy the backend (CORS uses this URL).

---

## Step 4 — Update README

Add your live URLs to `README.md`:

```markdown
## Hosted Application

| Service | URL |
|---------|-----|
| Frontend | https://your-app.vercel.app |
| Backend | https://your-api.onrender.com |
| GitHub | https://github.com/yourusername/society-maintenance-tracker |
```

Commit and push the README update.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| MongoDB connection fails on Render | Allow `0.0.0.0/0` in Atlas Network Access |
| Frontend shows API error | Check `VITE_API_URL` in Vercel env vars |
| CORS error | Set `FRONTEND_URL` on Render to exact Vercel URL |
| Render cold start slow | Free tier sleeps after inactivity — first request may take ~30s |
| Emails not sending | Verify `EMAIL_API_KEY` and Resend sender domain |

---

## Submission Checklist

- [ ] Backend live on Render
- [ ] Frontend live on Vercel
- [ ] `/api/health` returns `"mongo": "connected"`
- [ ] GitHub repo is public on `main` branch
- [ ] README updated with hosted URLs
- [ ] `.env` not in repository
