#!/bin/sh

echo "[Configurator] Waiting for Kong Admin API to be available..."

# Loop until we can successfully connect. Use the correct service name!
until curl -s -f http://kong-gateway:8001; do
  echo "[Configurator] Kong is not available yet - sleeping"
  sleep 5
done

echo "[Configurator] Kong is ready! Applying configuration..."

# Create the Service. Use the correct service name!
curl -i -f -X POST http://kong-gateway:8001/services \
  -H "Content-Type: application/json" \
  -d '{"name": "crs-backend-service", "url": "http://backend-app:3000"}'

if [ $? -ne 0 ] && [ $? -ne 22 ]; then
  echo "!!! [Configurator] Failed to create Kong service. Aborting."
  exit 1
fi

echo "[Configurator] Service configuration applied."

# Create the Route. Use the correct service name!
curl -i -f -X POST http://kong-gateway:8001/services/crs-backend-service/routes \
  -H "Content-Type: application/json" \
  -d '{"name": "crs-api-routes", "paths": ["/api"], "strip_path": false}'

if [ $? -ne 0 ] && [ $? -ne 22 ]; then
  echo "!!! [Configurator] Failed to create Kong route. Aborting."
  exit 1
fi

echo "[Configurator] Route configuration applied."
echo "[Configurator] Configuration complete. Exiting."