# Clouding Academy reverse-engineering notes

## Product thesis

The reference product is best understood as a gamified certification-learning operating system rather than a static question bank. Its strongest loop is:

`choose certification -> assess -> diagnose weakness -> daily practice -> rapid recall -> architecture work -> hands-on lab -> readiness -> credential`

## Reconstructed capability map

1. Identity and account lifecycle
2. Provider/certification catalog
3. Practice Hub and readiness dashboard
4. Timed and untimed exam engine
5. Domain-targeted practice
6. Daily adaptive learning loop
7. Blitz rapid-recall mode
8. Architecture Builder
9. Disposable cloud labs
10. XP, streaks, badges and leaderboards
11. Paid entitlements and redemption flows
12. Internal content, support and analytics tooling

## Known architecture signals from the prior research phase

Public material from the reference product indicates a static S3/CloudFront frontend, Lambda-backed services, DynamoDB, EventBridge warm-up behavior, Stripe commerce and isolated AWS Organizations accounts for hands-on labs. CloudFormation and SCP guardrails are used as part of the lab lifecycle.

These observations guide AcademyOS AI, but we deliberately avoid reproducing proprietary source code or hidden implementation details. The new implementation uses independently designed data models and behavior.

## Competitive extension

AcademyOS AI is provider-neutral by design. The content hierarchy is:

`Provider -> Certification -> Domain -> Learning Path`

The long-term provider map includes AWS, Azure, GCP, Snowflake, Databricks, Kubernetes, Terraform, GitHub, Anthropic and OpenAI-oriented professional learning paths.
