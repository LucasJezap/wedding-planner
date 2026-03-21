.PHONY: app db appDb full rebuild rebuild-app fresh hard-clean doctor check-port-3000 stop down

app:
	docker compose up -d app

db:
	docker compose up -d postgres

appDb:
	docker compose up -d postgres app

full:
	docker compose up -d

rebuild-app:
	docker compose up -d --build app

rebuild:
	docker compose up -d --build

fresh:
	docker compose up -d --build --force-recreate

hard-clean: check-port-3000
	rm -rf .next
	docker compose down --remove-orphans
	docker image rm -f weddingplanner-app || true
	docker compose build --no-cache app
	docker compose up -d --force-recreate postgres app

doctor:
	@echo "Port 3000 listeners:"
	@lsof -nP -iTCP:3000 -sTCP:LISTEN || true
	@echo
	@echo "Docker services:"
	@docker compose ps

check-port-3000:
	@if lsof -nP -iTCP:3000 -sTCP:LISTEN | grep -E 'node|next-server' >/dev/null; then \
		echo "Host process is already listening on port 3000. Stop it before running Docker."; \
		lsof -nP -iTCP:3000 -sTCP:LISTEN; \
		exit 1; \
	fi

stop:
	docker compose stop

down:
	docker compose down
