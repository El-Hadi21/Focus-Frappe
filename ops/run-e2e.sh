#!/bin/bash
cd "$(dirname "$0")"
rm -rf ./e2e-results
mkdir -p ./e2e-results/test-results ./e2e-results/playwright-report
chmod -R 777 ./e2e-results

docker compose -f ./compose-e2e.yml up --build \
  --abort-on-container-exit \
  --exit-code-from playwright
EXIT_CODE=$?

docker compose -f ./compose-e2e.yml down -v
exit $EXIT_CODE