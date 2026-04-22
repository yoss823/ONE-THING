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

echo "Testing daily email cron..."
curl -sS -H "Authorization: Bearer $CRON_SECRET" "$BASE_URL/api/cron/daily-email" | jq .

echo
echo "Testing weekly email cron..."
curl -sS -H "Authorization: Bearer $CRON_SECRET" "$BASE_URL/api/cron/weekly-email" | jq .

echo
echo "Testing monthly email cron..."
curl -sS -H "Authorization: Bearer $CRON_SECRET" "$BASE_URL/api/cron/monthly-email" | jq .
