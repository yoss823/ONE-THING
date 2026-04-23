# Launch Action Library Spec

## Purpose

This file defines the initial checked-in content contract for the ONE THING launch library. It covers:

- the six launch categories
- the machine-readable action seed files
- the silent selection and adaptation rules

The source-of-truth files live in `data/action-library/`.

## Files

- `data/action-library/launch-categories.json`
- `data/action-library/launch-actions.json`
- `data/action-library/adaptation-rules.json`

## Category Contract

Launch categories:

1. Mental clarity
2. Organization
3. Health / Energy
4. Work / Business
5. Personal projects
6. Relationships

Each category exists to produce small actions that are:

- concrete
- finishable in 5, 10, or 15 minutes
- safe for a mainstream launch audience
- useful without extra motivation or explanation

## Action Contract

Each action record includes:

- `id`
- `category_slug`
- `title`
- `instruction`
- `minutes`
- `why_it_matters`
- `complexity`
- `texture`
- `is_fallback`

Authoring rules:

- Titles should be verb-first.
- Instructions should be one sentence and describe one clear task.
- Reasons should explain utility plainly, not inspiration.
- The task must be doable inside the declared time without hidden setup.
- Each category must include at least one fallback action.

## Texture

`texture` is the activity shape of the action. It is used to vary the feel of consecutive sends without changing the category.

Examples:

- `clear`
- `capture`
- `plan`
- `prepare`
- `move`
- `review`
- `reach_out`
- `make`
- `repair`

Texture is intentionally broad. It does not need to be unique per category, but it must be stable enough for the selector to avoid repetitive patterns.

## No-Repeat Rules

The selector should avoid sending the exact same action to the same user in the same category for 10 days.

Rule order:

1. Exclude exact action ids shown in the previous 10 days.
2. Keep fallback actions out unless the normal pool is exhausted.
3. If the pool is empty, relax texture preferences before relaxing exact-repeat protection.
4. If needed, allow the oldest eligible action that is at least 10 days old.
5. If needed, allow the fallback action if it was not used in the previous 7 days.
6. If inventory is still exhausted, return the oldest action in the category and log the rule breach.

This keeps the system deterministic even when content is thin, while still preferring novelty.

## Texture Variation Rules

The selector should avoid giving the same texture two sends in a row inside a category.

Soft preference:

- Prefer a texture that was not used in the previous 3 sends in that category.

If multiple actions are otherwise equal:

1. Prefer the action that matches the current target complexity.
2. Prefer an unseen action.
3. Prefer a texture absent from the recent 3-send window.
4. Break final ties by oldest last-send timestamp.

## Silent Adaptation Rules

These adjustments should happen without telling the user that the system changed difficulty.

### 3-day pause downshift

If a user receives 3 consecutive actions in a category without marking them done, downshift the next selection by one complexity tier:

- `stretch -> standard`
- `standard -> lighter`
- `lighter -> lighter`

The downshift stays in effect until the user completes one action in that category.

### 5-day completion upshift

If a user completes 5 consecutive actions in a category, upshift the next selection by one complexity tier:

- `lighter -> standard`
- `standard -> stretch`
- `stretch -> stretch`

The upshift stays in effect until the user misses one action in that category.

## Recommended Selection Flow

1. Load active actions for the user's category.
2. Remove exact-repeat candidates inside the cooldown window.
3. Compute target complexity from category default plus any streak shift.
4. If possible, remove actions with the same texture as the most recent send.
5. Score remaining actions by complexity match, unseen status, and texture freshness.
6. If no action remains, relax the rules in the order defined above.
7. Save the chosen action id, texture, complexity, and selection reason with the send record.

## Notes For Implementation

- The launch library is intentionally plain and broad, not personalized.
- Complexity is category-scoped and should use send/completion history from the same category.
- The JSON files are intended to seed Postgres or drive an export job later without relying on a CMS.
