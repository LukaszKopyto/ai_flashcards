# Cloudflare Pages Deployment Guide

This guide explains how to deploy the AI Flashcards application to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account with Pages enabled
2. GitHub repository with your AI Flashcards code
3. Required environment variables set up

## Setup for Cloudflare Pages

### 1. Create a Cloudflare Pages Project

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click **Create Application** > **Pages**
4. Connect to your GitHub repository
5. Select the AI Flashcards repository

### 2. Configure Build Settings

Use these settings for the build configuration:

| Setting                | Value                                  |
| ---------------------- | -------------------------------------- |
| Project name           | ai-flashcards (or your preferred name) |
| Production branch      | main                                   |
| Framework preset       | Astro                                  |
| Build command          | pnpm run build                         |
| Build output directory | dist                                   |

### 3. Set Environment Variables

In the Pages project settings, add the following environment variables:

- `SUPABASE_URL`: Your Supabase URL
- `SUPABASE_KEY`: Your Supabase anonymous key

### 4. Deploy with GitHub Actions (Recommended)

To use GitHub Actions for deployment:

1. Add these secrets to your GitHub repository:

   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_KEY`: Your Supabase anonymous key
   - `KV_SESSION_ID`: Your Cloudflare KV namespace ID for sessions

2. The GitHub workflow (`.github/workflows/main.yml`) will automatically:
   - Build the application
   - Deploy to Cloudflare Pages
   - Report the deployment status

## Local Development with Cloudflare Workers

To test the site locally:

1. Install Wrangler: `npm install -g wrangler`
2. Create a `.dev.vars` file with your environment variables
3. Run: `wrangler pages dev dist`

## Troubleshooting

- If you encounter deployment failures, check the build logs in GitHub Actions
- For local development issues, ensure your Wrangler CLI is up to date
- If the site doesn't load properly, verify your Cloudflare Pages settings and environment variables

## Further Resources

- [Astro Cloudflare Documentation](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Wrangler Action Documentation](https://github.com/cloudflare/wrangler-action)
