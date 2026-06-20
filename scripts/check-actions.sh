#!/bin/bash

# GitHub Actions Monitor Script
# Usage: ./scripts/check-actions.sh [owner/repo]

OWNER="${1%/*}"
REPO="${1#*/}"

if [ -z "$OWNER" ] || [ -z "$REPO" ]; then
  # Get from git config if not provided
  ORIGIN=$(git remote get-url origin)
  if [[ $ORIGIN =~ github\.com[:/]([^/]+)/([^/]+) ]]; then
    OWNER="${BASH_REMATCH[1]}"
    REPO="${BASH_REMATCH[2]%.git}"
  fi
fi

if [ -z "$OWNER" ] || [ -z "$REPO" ]; then
  echo "Error: Could not determine GitHub repo. Provide as argument: owner/repo"
  exit 1
fi

API_URL="https://api.github.com/repos/$OWNER/$REPO/actions/runs?per_page=10&sort=created&direction=desc"

echo "======================================"
echo "GitHub Actions Monitor"
echo "Repository: $OWNER/$REPO"
echo "======================================"
echo ""

# Fetch workflow runs
RESPONSE=$(curl -s "$API_URL")

# Check if response is valid
if echo "$RESPONSE" | grep -q "\"workflow_runs\""; then
  # Parse and display
  echo "$RESPONSE" | jq -r '.workflow_runs[] | "\(.updated_at | .[0:10]) | \(.conclusion // "in_progress") | \(.name) | \(.head_branch)"' 2>/dev/null || \
  echo "$RESPONSE" | grep -o '"name":"[^"]*"' | head -10

  echo ""
  echo "Full Status URL:"
  echo "https://github.com/$OWNER/$REPO/actions"
else
  echo "Error fetching workflow data"
  echo "Response: $RESPONSE"
  exit 1
fi
