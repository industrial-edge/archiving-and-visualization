#!/bin/bash
set -e
SELF_PATH=$(realpath "$0")
WORKDIR=$(dirname "${SELF_PATH}")
cd "${WORKDIR}"

docker-compose build
