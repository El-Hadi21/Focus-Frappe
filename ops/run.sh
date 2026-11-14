#!/bin/bash
cd "$(dirname "$0")"
docker compose -f ./compose.yml up --build