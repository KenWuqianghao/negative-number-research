# Negative Number Research Inc.

At Negative Number Research Inc., we are attempting to find and document all available negative numbers.

This is a volunteer-lead research position, where anyone is able to contribute. Simply type a negative number in, and we'll check if we've got it. If we have, no worries, just try another. If it's a new number, thank you for your hard work!

Inspired by [numberresearch.xyz](https://numberresearch.xyz/).

## Stack

- **Frontend**: Vanilla HTML/CSS/JS
- **Backend**: Vercel Serverless Functions
- **Database**: Vercel Postgres (Neon)
- **Font**: JetBrains Mono

## Local Development

```bash
npm install
vercel dev
```

Requires a Postgres database. Set `POSTGRES_URL` in `.env.local` or connect one via the Vercel dashboard.

## Deployment

Deployed on Vercel. Pushes to `main` trigger automatic deployments.

```bash
vercel deploy --prod
```
