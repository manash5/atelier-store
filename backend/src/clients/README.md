# clients/

Wrappers around third-party HTTP APIs (email, payments, search, …). Services call these; controllers and repositories never do. Each client reads its credentials from `config/env.ts`.

This folder is empty for now because the catalog uses no external services.
