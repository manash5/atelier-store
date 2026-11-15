# cron/

Scheduled jobs (e.g. low-stock reports, expired-session cleanup). A job calls services, never repositories or the database directly, and is registered from `server.ts` so it never runs in tests or one-off scripts.

This folder is empty for now because no scheduled work exists yet.
