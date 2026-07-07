# Deployment to Vercel

This project is configured to deploy to Vercel (recommended for Next.js App Router).

Steps:
1. Create a Vercel account and link this GitHub repository.
2. Set environment variables in Project Settings -> Environment Variables (Production & Preview):
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET (optional sandbox)
   - MPESA_API_KEY, MPESA_API_URL (optional sandbox)
   - SENDGRID_API_KEY (optional for transactional email)
   - TAX_PERCENT (default: 2)
3. Build command: `npm run build`
   Output directory: leave empty (Vercel detects Next.js projects)
4. Deploy. Use Stripe test keys to validate Checkout flows.

Local testing with Vercel CLI:
- Install: `npm i -g vercel`
- Run `vercel dev` to emulate the Vercel environment locally.

Notes:
- Do NOT commit secrets to the repository.
- After deployment, add the Stripe webhook endpoint URL in your Stripe dashboard and set STRIPE_WEBHOOK_SECRET in Vercel.
