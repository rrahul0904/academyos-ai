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
