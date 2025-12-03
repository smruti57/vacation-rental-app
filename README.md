**Deployment (Recommended: Render / Heroku / Railway)**
- **Purpose**: Run this repository as a persistent Node process (Express app). This keeps behavior identical to localhost and works with MongoDB Atlas.

**Prep (local checks)**
- Ensure `ATLAS_URL`, `SESSION_SECRET`, and any API keys (e.g., `TOMTOM_API_KEY`) are available.
- Ensure `package.json` has a `start` script (`node app.js`). Use `npm start` locally to test.

**Deploy to Render (recommended)**
1. Push your repo to GitHub.
2. Create a new Web Service on Render and connect your GitHub repo.
3. In Render's service settings:
   - Build Command: (leave empty or `npm install`)
   - Start Command: `node app.js` (or leave default as Render will use `start` script)
4. Add Environment Variables (Environment → Environment Groups):
   - `ATLAS_URL` = your MongoDB Atlas connection string (mongodb+srv://... or non-SRV seed list if needed)
   - `SESSION_SECRET` = a long random string
   - `TOMTOM_API_KEY` = (if used)
   - `NODE_ENV` = `production`
5. Deploy and check logs. Successful logs should show `connected to db` and `server listening on port ...`.

**Deploy to Heroku**
1. Install the Heroku CLI and log in.
2. From your project root:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```
3. Set config vars:
   ```bash
   heroku config:set ATLAS_URL="<your_atlas_url>" SESSION_SECRET="<secret>" TOMTOM_API_KEY="<key>"
   ```
4. Open the app with `heroku open` and check logs with `heroku logs --tail`.

**If you prefer Vercel (serverless)**
- Note: Vercel runs serverless functions — the app must be refactored to export the Express app and use `serverless-http` (not covered by these steps). For zero-code changes, use Render/Heroku/Railway instead.

**Seeding sample data**
- To seed data to whichever DB you point at (Atlas or local), run the seed script. First set `ATLAS_URL` env var, then:
  ```powershell
  $env:ATLAS_URL = "mongodb+srv://<user>:<pass>@cluster0.../<dbname>?retryWrites=true&w=majority"
  node init/index.js
  ```
- I can add a controlled `npm run seed` script if you'd like.

**Notes & troubleshooting**
- If you see DNS SRV errors (ENOTFOUND) for `mongodb+srv://`, try using the standard (non-SRV) Atlas connection string or verify your DNS/network.
- For testing quickly, you can temporarily set Atlas Network Access to allow `0.0.0.0/0` while deploying.

---
If you want, I can:
- Add an `npm run seed` script and patch `init/index.js` to use `process.env.ATLAS_URL` (so seeding uses Atlas when available), or
- Prepare a single-click Render deploy guide with screenshots.

Which of those would you like next?