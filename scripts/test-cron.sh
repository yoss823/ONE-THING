#!/bin/bash
set -euo pipefail

# Usage: BASE_URL=https://your-domain.vercel.app CRON_SECRET=your-secret ./scripts/test-cron.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:?CRON_SECRET is required}"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required." >&2
  exit 1
fi

run_cron_check() {
  local label="$1"
  local path="$2"

  echo "Testing ${label} cron..."
  local response
  response="$(curl -sS -H "Authorization: Bearer $CRON_SECRET" "$BASE_URL${path}")"
  echo "$response" | jq .

  local has_error
  has_error="$(echo "$response" | jq -r '(.error // empty) != ""')"
  if [ "$has_error" = "true" ]; then
    echo "❌ ${label} cron returned an error." >&2
    exit 1
  fi
}

run_cron_check "daily email" "/api/cron/daily-email"

echo
run_cron_check "weekly email" "/api/cron/weekly-email"

echo
run_cron_check "monthly email" "/api/cron/monthly-email"

echo
echo "✅ Cron checks completed without endpoint-level errors."
