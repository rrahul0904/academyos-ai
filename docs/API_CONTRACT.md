# Planned API contract

The current Wave 1 is client-only. Wave 2 will preserve these resource boundaries.

## Catalog

- `GET /v1/providers`
- `GET /v1/certifications`
- `GET /v1/certifications/:id`

## Learning

- `POST /v1/sessions/exam`
- `PUT /v1/sessions/exam/:id/answers/:questionId`
- `POST /v1/sessions/exam/:id/finish`
- `POST /v1/sessions/blitz`
- `POST /v1/sessions/architecture/:scenarioId/evaluate`

## Progress

- `GET /v1/me/progress`
- `GET /v1/me/readiness/:certificationId`
- `GET /v1/me/history`

## Commerce

- `GET /v1/me/entitlements`
- `POST /v1/checkout`
- `POST /v1/webhooks/stripe`
- `POST /v1/redemptions`

## Labs

- `POST /v1/labs/:labId/leases`
- `GET /v1/lab-leases/:leaseId`
- `POST /v1/lab-leases/:leaseId/validate`
- `DELETE /v1/lab-leases/:leaseId`

Every mutating endpoint will carry a request ID and an actor identity. Lab and commerce operations are idempotent by contract.


## Study Lab API

### GET /api/study-provider

Returns the configured study generation mode without exposing credentials.

Response fields:

- `provider`: `local` or configured remote provider.
- `configured`: whether required runtime configuration is present.
- `model`: remote model identifier when applicable.

### POST /api/study-pack

Request:

```json
{
  "title": "Optional title",
  "sourceText": "At least 40 characters of source material"
}
```

Response:

```json
{
  "pack": {
    "id": "...",
    "title": "...",
    "summary": ["..."],
    "flashcards": [{"id":"card-1","front":"...","back":"..."}],
    "quiz": [{"id":"quiz-1","prompt":"...","options":["..."],"answer":0,"explanation":"..."}],
    "sourceDigest": "...",
    "provider": "local"
  }
}
```

The default local provider performs no network request. Remote generation is opt-in through server configuration.
