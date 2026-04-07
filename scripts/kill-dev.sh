#!/bin/bash
# Helper script para matar procesos de desarrollo de OmniDoc

# Matar por nombre de proceso (más seguro que lsof | xargs kill)
pkill -f "next dev" && echo "Next.js killed"
pkill -f "nest start" && echo "NestJS killed"

# Opcional: matar por puerto específico
if [ "$1" == "--port" ] && [ -n "$2" ]; then
  lsof -ti:$2 | xargs kill -9 2>/dev/null && echo "Port $2 freed"
fi
