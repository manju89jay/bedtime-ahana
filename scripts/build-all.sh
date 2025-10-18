#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ "${CI:-}" == "true" ]]; then
  echo "CI environment detected. Installing dependencies with npm ci..."
  npm ci
elif [[ -d node_modules ]]; then
  echo "Dependencies already installed. Skipping npm ci."
else
  echo "Installing dependencies with npm ci..."
  npm ci
fi

echo "Running lint checks..."
npm run lint

echo "Running test coverage..."
npm run coverage

echo "Building application..."
npm run build

echo "Build pipeline completed successfully."
