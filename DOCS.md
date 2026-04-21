# DOCS

## Repository Findings

- Repository currently contains a minimal `README.md` and no product or engineering docs.
- `README.md` defines the product premise: ONE THING is a subscription product that emails users each morning at 8am with simple, concrete actions that take 5-15 minutes.
- No existing `DOCS.md` was present at the start of this task.
- Git branch is `main` tracking `origin/main`.
- Untracked local folders `.agents/` and `.claude/` exist in the worktree and were left untouched because they are unrelated to this task.

## Changes Made

- Added [`docs/one-thing-mvp-brief.md`](docs/one-thing-mvp-brief.md) as the canonical MVP scope document for ONE THING.
- Defined the target user as busy professionals who want practical self-improvement guidance with minimal decision-making overhead.
- Fixed the core MVP journey around a single paid subscription flow, 1-3 category selection, timezone capture, and one daily 8:00am local-time email.
- Specified the exact email promise: one email per day with exactly one 5-15 minute action per selected category, plus a required fallback action if category content is missing.
- Chose the initial category set: Fitness, Nutrition, Focus, Relationships, and Home.
- Chose the initial monetization assumptions: one `$10/month` plan, 7-day free trial, no free tier, and no annual plan at launch.
- Documented 5 explicit MVP non-goals to prevent scope creep during implementation.
