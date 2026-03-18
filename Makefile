.PHONY: app db appDb full stop

app:
	docker compose up -d --build --force-recreate app

db:
	docker compose up -d --force-recreate postgres

appDb:
	docker compose up -d --build --force-recreate postgres app

full:
	docker compose up -d --build --force-recreate

stop:
	docker compose stop
