ENV ?= dev
MSG ?= dev
DATE_TIME ?= 2026-02-17 00:01:01

COMPOSE = docker compose -f docker-compose.$(ENV).yml --env-file .env.$(ENV)

all:
	if [ "$(ENV)" = "prod" ]; then \
		mkdir -p database backend_pics movies; \
	fi
	$(COMPOSE) up --build -d

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down -v

fclean: clean
	docker system prune --all -f --volumes
	rm -rf database backend_pics movies

ps:
	$(COMPOSE) ps -a

history:
	$(COMPOSE) logs -f

push :
	git add -A
	GIT_AUTHOR_DATE="$(DATE_TIME)" GIT_COMMITTER_DATE="$(DATE_TIME)" git commit -m "$(MSG)"
	git push

owner:
	sudo find ~ -type d -user root -exec sudo chown -R ${USER}: {} +