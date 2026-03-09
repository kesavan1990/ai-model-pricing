# Price update flow

How pricing data is kept up to date without a backend or manual edits.

## Flow

```
AI pricing docs (Gemini & OpenAI)
        ↓
Scraper script (scripts/update-pricing.mjs)
        ↓
GitHub Action (daily)
        ↓
Update pricing.json
        ↓
Commit to repo
        ↓
Frontend loads updated data
```

## Steps

1. **AI pricing docs**  
   Official pages are the source of truth:
   - [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
   - [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)

2. **Scraper script**  
   `scripts/update-pricing.mjs` fetches those pages, parses model names and prices (text/embedding only for OpenAI), and writes a single `pricing.json` in the repo root.

3. **GitHub Action (daily)**  
   `.github/workflows/update-pricing.yml` runs on a schedule (e.g. daily) and on manual trigger. It checks out the repo, runs the script, then commits and pushes `pricing.json` only if it changed.

4. **Update pricing.json**  
   The script overwrites `pricing.json` with the latest parsed data. The file is the only artifact; no database or API.

5. **Commit to repo**  
   The workflow commits with a message like `chore: update pricing from official docs [automated]` and pushes to the default branch.

6. **Frontend loads updated data**  
   The app (`index.html`) loads `pricing.json` via `fetch()`. On GitHub Pages (or any static host), the next request gets the new file; users can also use “Refresh from web” for a live scrape from the browser.

## Running locally (optional)

From the repo root:

```bash
node scripts/update-pricing.mjs
```

This updates `pricing.json` locally. Commit and push yourself, or rely on the GitHub Action to do it on schedule.

## Manual run

In your GitHub repo: **Actions** → **Update pricing** → **Run workflow**.
