cd /var/www/html
npm install

if [ -n "${MIGRATION_NAME:-}" ]; then
	npm run migration:generate -- "src/migrations/${MIGRATION_NAME}"
fi

npm run migration:run:dev
exec npm run nodemon
