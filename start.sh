if [ "$PROCESS_TYPE" = "api" ]; then
  echo "Starting API server"
  node dist/server.js
elif [ "$PROCESS_TYPE" = "worker" ]; then
  echo "Starting Worker"
  node dist/services/worker.js
else
  echo "Unknown PROCESS_TYPE. Please set PROCESS_TYPE=api or PROCESS_TYPE=worker"
  exit 1
fi