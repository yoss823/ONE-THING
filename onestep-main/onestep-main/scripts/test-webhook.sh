#!/bin/bash
set -euo pipefail

# Requires Stripe CLI installed: brew install stripe/stripe-cli/stripe
# Usage: ./scripts/test-webhook.sh

if ! command -v stripe >/dev/null 2>&1; then
  echo "stripe CLI is required." >&2
  exit 1
fi

echo "Triggering checkout.session.completed..."
stripe trigger checkout.session.completed

echo
echo "Triggering customer.subscription.updated..."
stripe trigger customer.subscription.updated

echo
echo "Triggering customer.subscription.deleted..."
stripe trigger customer.subscription.deleted
