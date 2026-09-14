# Target architecture

## Current slice

The current implementation is intentionally dependency-free:

- Static browser client in `public/`
- Shared deterministic domain logic in `src/domain.mjs`
- In-browser persistence via `localStorage`
- Node HTTP server in `server.mjs`
- Node built-in test runner

This keeps the first vertical slice runnable even when package registries, cloud credentials or third-party services are unavailable.

## Production target

```text
Browser / Next.js
      |
CloudFront
      |
API boundary
      |
Application services
 |       |        |         |
Auth   Learning  Billing   Labs
 |       |        |         |
IdP   DynamoDB  Stripe   EventBridge/SQS
                            |
                     Lab orchestrator
                            |
                    AWS Organizations
                            |
                    Sandbox account pool
```

## Core bounded contexts

- Catalog: providers, certifications, domains, content versions
- Learning: questions, attempts, daily sessions, Blitz cards, architecture scenarios
- Progress: XP, streaks, readiness, achievements
- Commerce: products, entitlements, redemptions, subscriptions
- Labs: templates, leases, validators, evidence, cleanup
- Operations: reports, moderation, audit, support and analytics

## Design rule

Scoring and entitlement decisions must be deterministic and testable. AI may recommend, explain and generate drafts, but it must not silently become the source of truth for pass/fail, billing access or lab cleanup.
