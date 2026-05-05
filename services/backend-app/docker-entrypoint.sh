#!/bin/sh

# This is the entrypoint script for the Docker container.

echo "Container entrypoint script running..."

# Run the database migrations.
# The 'npm run migrate' command will connect to the database and apply any pending migrations.
echo "Running database migrations..."
npm run migrate:up

# Check the exit code of the migration command.
# If it's not 0 (success), then something went wrong.
if [ $? -ne 0 ]; then
  echo "Database migrations failed. Aborting container startup."
  exit 1
fi

echo "Migrations completed successfully."

# After migrations, execute the command that was passed to this script.
# In our case, this will be "npm run start" from the Dockerfile's CMD.
exec "$@"