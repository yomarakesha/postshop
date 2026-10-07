#!/usr/bin/env bash
# Starts backend, admin and client, each in its own gnome-terminal window.
# Frontends start via npm: pnpm hangs in admin/ switching to its pinned packageManager version.
# Ctrl+C in this terminal stops all three. Ctrl+C in a window stops only that service.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDDIR="$(mktemp -d)"

# Backend: use a virtualenv if present, otherwise the system python.
BACKEND_ACTIVATE=""
for venv in "$ROOT/backend/.venv" "$ROOT/backend/venv"; do
  if [[ -f "$venv/bin/activate" ]]; then
    BACKEND_ACTIVATE="source '$venv/bin/activate' && "
    break
  fi
done

declare -A SERVICES=(
  [backend]="cd '$ROOT/backend' && ${BACKEND_ACTIVATE}uvicorn app.main:app --reload"
  [admin]="cd '$ROOT/admin' && npm run dev"
  [client]="cd '$ROOT/client' && npm run dev"
)

open_window() {
  local name="$1" cmd="$2"
  # The window's bash records its PID (also its process group ID), then runs the service.
  # If the service crashes, the window stays open so the error is visible.
  gnome-terminal --title="postshop: $name" -- bash -c "
    echo \$\$ > '$PIDDIR/$name.pid'
    $cmd
    code=\$?
    echo
    echo '[$name] exited with code '\$code'. Press Enter to close.'
    read -r
  "
}

stop_all() {
  trap - INT TERM
  echo
  echo "Stopping..."
  for f in "$PIDDIR"/*.pid; do
    [[ -f "$f" ]] || continue
    pid="$(cat "$f")"
    kill -TERM -- "-$pid" 2>/dev/null || true
  done
  sleep 2
  for f in "$PIDDIR"/*.pid; do
    [[ -f "$f" ]] || continue
    pid="$(cat "$f")"
    kill -KILL -- "-$pid" 2>/dev/null || true
  done
  rm -rf "$PIDDIR"
  echo "All stopped."
  exit 0
}
trap stop_all INT TERM

for name in backend admin client; do
  open_window "$name" "${SERVICES[$name]}"
done

# Wait until every window has written its PID.
for _ in $(seq 50); do
  [[ $(ls "$PIDDIR"/*.pid 2>/dev/null | wc -l) -eq 3 ]] && break
  sleep 0.2
done

echo "backend  http://localhost:8000"
echo "admin    http://localhost:3020"
echo "client   http://localhost:3010"
echo "Press Ctrl+C to stop everything."

# Exit on our own once all services are gone.
while true; do
  alive=0
  for f in "$PIDDIR"/*.pid; do
    [[ -f "$f" ]] && kill -0 "$(cat "$f")" 2>/dev/null && alive=1
  done
  [[ $alive -eq 0 ]] && { rm -rf "$PIDDIR"; echo "All services exited."; exit 0; }
  sleep 1
done
