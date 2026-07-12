# Duet — Deploy & Use Tonight 🚀

Follow these in order. Total time: **~45–60 min** (most of it is the APK build queue, which runs in the cloud while you wait).

There are **3 phases**:
1. Deploy the backend to Railway (free) → get a public HTTPS URL
2. Build the signed Android APK with that URL baked in
3. Install the APK on both phones, pair, chat & video call

---

## Prerequisites (install once)

- **Node.js 18+** — https://nodejs.org (LTS)
- A **Railway** account — https://railway.app (sign in with GitHub)
- An **Expo** account — https://expo.dev (free)

Open a terminal in `d:\Freelance-Projects\duet`.

---

## Phase 0 — Install dependencies

```powershell
# Backend
cd apps\backend
npm install
npx prisma generate

# Mobile
cd ..\mobile
npm install
```

> We use plain `npm install` inside each app (not the workspace root) so Railway and EAS builds stay simple and self-contained.

---

## Phase 1 — Deploy the backend to Railway

You get a Postgres database **and** the API, both on HTTPS, for free.

### 1.1 Push the code to GitHub

Railway deploys from a Git repo. If `duet` isn't on GitHub yet:

```powershell
cd d:\Freelance-Projects\duet
git init
git add .
git commit -m "chore: initial Duet MVP"
# create an EMPTY repo on github.com first, then:
git remote add origin https://github.com/<you>/duet.git
git branch -M main
git push -u origin main
```

### 1.2 Create the Railway project

1. Go to https://railway.app → **New Project** → **Deploy from GitHub repo** → pick `duet`.
2. When it asks for the service settings, open the service → **Settings**:
   - **Root Directory**: `apps/backend`
   - **Builder**: it will auto-detect the `Dockerfile`. Leave it.
3. Add a database: in the project, click **New** → **Database** → **Add PostgreSQL**.

### 1.3 Set environment variables

Open your **backend service** → **Variables** and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Click "Add Reference" → select the Postgres `DATABASE_URL` |
| `JWT_SECRET` | any long random string (e.g. run `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | another long random string |
| `JITSI_DOMAIN` | `meet.jit.si` |

> `PORT` is provided by Railway automatically — don't set it.

### 1.4 Deploy & get your URL

1. Railway auto-deploys. Watch the **Deploy logs** until you see `Duet API running on port ...`.
2. Go to **Settings → Networking → Generate Domain**. You'll get something like:
   ```
   https://duet-production-xxxx.up.railway.app
   ```
3. **Test it** — open in a browser:
   ```
   https://duet-production-xxxx.up.railway.app/api/health
   ```
   You should see `{"status":"ok",...}`. ✅
   Swagger API docs are at `/api/docs`.

**Copy that HTTPS URL — you need it in Phase 2.**

---

## Phase 2 — Build the signed Android APK

The APK has your backend URL baked in at build time.

### 2.1 Put your Railway URL in the app

Edit **`apps/mobile/eas.json`** — replace **both** `EXPO_PUBLIC_API_URL` values:

```json
"env": {
  "EXPO_PUBLIC_API_URL": "https://duet-production-xxxx.up.railway.app"
}
```

### 2.2 Log in to EAS & build

```powershell
cd d:\Freelance-Projects\duet\apps\mobile
npm install -g eas-cli
eas login
eas build:configure        # accept defaults; this fills in your projectId

# Build the signed APK (Expo generates & manages the keystore for you)
eas build --platform android --profile preview
```

- When asked **"Generate a new Android Keystore?"** → **Yes**. Expo creates and stores a real signing key — this is what makes it a *signed release APK*.
- The build runs in Expo's cloud (~15–25 min). When done, the terminal prints a **download link**, and it's also on https://expo.dev under your project → Builds.

### 2.3 Download the APK

Download the `.apk` from that link. This single file is what you share over WhatsApp.

---

## Phase 3 — Install & use on both phones

1. **Send the APK** to both phones via WhatsApp (or any transfer).
2. On each phone: tap the APK → Android will warn "install from unknown source" → **Allow / Install anyway**. (No Play Store needed.)
3. Open **Duet** on both phones.
4. **Person A**: Register → on the pairing screen, tap **Copy my code**, send it to Person B.
5. **Person B**: Register → paste A's code → **Pair now**.
6. You're connected 💕 — Home shows both of you & days together. Open **Chat** to message in real time. Tap **📹** to start a video call (opens your private Jitsi room; the other person taps 📹 too and you're in the same call).

---

## Updating later

- **Backend change**: `git push` → Railway redeploys automatically.
- **App change**: bump `version` in `app.json`, run `eas build -p android --profile preview` again, reshare the APK.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `/api/health` fails | Check Railway deploy logs; make sure Root Directory = `apps/backend` and `DATABASE_URL` is referenced. |
| App shows "Network error" | The URL in `eas.json` is wrong or missing `https://`. Rebuild after fixing. |
| Chat not real-time | Confirm both phones are online; the socket uses the same Railway URL. |
| Video call won't open | Make sure the phone has a browser; Jitsi opens `meet.jit.si`. Grant camera/mic when asked. |
| "You already have a partner" | Each account pairs once. Use a fresh account or unpair via `DELETE /api/couples/me`. |

---

## What's running

- **Backend**: NestJS + Prisma + PostgreSQL + Socket.IO on Railway (HTTPS).
- **Realtime**: Socket.IO for messages, typing, online status, read receipts.
- **Video**: Jitsi (free, no server) — a private room unique to your couple.
- **App**: Expo React Native, signed APK, no Play Store.

Enjoy your evening. 💛
