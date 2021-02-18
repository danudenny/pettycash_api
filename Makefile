SHELL=/bin/bash
BLACK        := $(shell tput -Txterm setaf 0)
GREEN        := $(shell tput -Txterm setaf 2)
YELLOW       := $(shell tput -Txterm setaf 3)
RESET 			 := $(shell tput -Txterm sgr0)
# ref: https://gist.github.com/rsperl/d2dfe88a520968fbc1f49db0a29345b9

force-recreate:
	@docker exec -it sicepat_postgres dropdb -U admin pettycash
	@echo "${GREEN}Database${RESET} ${YELLOW}pettycash${RESET} ${GREEN}Dropped 😱${RESET}"
	@docker exec -it sicepat_postgres createdb -U admin pettycash
	@echo "${GREEN}Database${RESET} ${YELLOW}pettycash${RESET} ${GREEN}Created 🙂${RESET}"
	@rm -rf src/migrations/
	@echo "${GREEN}Removing${RESET} ${YELLOW}src/migrations/${RESET} ${GREEN}Successfully 🙂🔫${RESET}"
	@echo "${GREEN}Generate${RESET} ${YELLOW}InitTable${RESET} ${GREEN}Migration file 🤗${RESET}"
	@yarn typeorm migration:generate -p -n 'InitTable'
	@echo "${GREEN}Running${RESET} ${YELLOW}InitTable${RESET} ${GREEN}Migration file 🥺${RESET}"
	@yarn typeorm migration:run
	@echo "${GREEN}Seeding${RESET} ${YELLOW}pettycash${RESET} ${GREEN}Database 🤑${RESET}"
	@yarn db:seed:dev
