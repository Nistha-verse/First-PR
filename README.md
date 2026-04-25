# FIRST PR

AI-powered onboarding platform for open source beginners.

## Stack
- React 18 + Vite + Tailwind CSS
- React Router v6
- Zustand state
- Framer Motion
- Howler.js sound effects
- Netlify Functions (OAuth proxy, GitHub API proxy, Groq AI, webhook + SSE)

## Environment Variables (Netlify)
Set all in Netlify site settings:
- `GROQ_API_KEY`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_API_TOKEN`
- `GITHUB_WEBHOOK_SECRET`
- `DATABASE_URL` (optional)

## Local Run
1. `npm install`
2. `npm run dev`

## Deploy + Webhook
1. Deploy to Netlify
2. Add env vars
3. In a demo repository, configure webhook:
   - URL: `https://<your-site>.netlify.app/.netlify/functions/github-webhook`
   - Content type: `application/json`
   - Secret: same as `GITHUB_WEBHOOK_SECRET`
   - Events: Pull requests + Pull request reviews

## Security Guarantees
- Frontend never calls GitHub/Groq directly
- OAuth token stored in `sessionStorage` only
- Webhook signatures verified with HMAC SHA256
- Authorization headers used for API auth
