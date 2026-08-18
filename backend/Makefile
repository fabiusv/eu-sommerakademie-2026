.PHONY: check migrate seed sync test docker-dev docker-dev-down docker-prod-config

check:
	ruff check .
	python manage.py check
	python manage.py makemigrations --check --dry-run

migrate:
	python manage.py migrate

seed:
	python manage.py seed_sources

sync:
	python manage.py sync_opportunities

test:
	pytest

docker-dev:
	docker compose -f compose.yaml -f compose.dev.yaml up --build

docker-dev-down:
	docker compose -f compose.yaml -f compose.dev.yaml down

docker-prod-config:
	docker compose --env-file .env.production -f compose.yaml -f compose.prod.yaml config
