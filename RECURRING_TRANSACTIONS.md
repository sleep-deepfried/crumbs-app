# Recurring Transactions Cron Job Setup

## Environment Variables

Add the following to your Vercel environment variables:

```
CRON_SECRET=your-random-secret-here
```

Generate a secure secret with:

```bash
openssl rand -base64 32
```

## Vercel Cron Configuration

The cron job is configured in `vercel.json` to run daily at midnight (UTC):

- Path: `/api/cron/process-recurring`
- Schedule: `0 0 * * *` (every day at 00:00 UTC)

## How It Works

1. The cron job runs daily at midnight
2. It finds all active recurring transactions where `nextOccurrence <= today`
3. For each transaction, it:
   - Creates a new regular transaction
   - Calculates the next occurrence date
   - Updates the recurring transaction record
   - Deactivates if past the end date

## Testing Locally

To test the cron endpoint locally, you need to:

1. Set `CRON_SECRET` in your environment
2. Make a GET request with the authorization header:

```bash
curl http://localhost:3000/api/cron/process-recurring \
  -H "Authorization: Bearer your-secret-here"
```

## Monitoring

Check the Vercel logs dashboard to see cron execution results. Each run returns:

- `processed`: Number of transactions successfully created
- `errors`: Number of failures
- `errorMessages`: Array of error details
- `timestamp`: When the job ran
