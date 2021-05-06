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

# CICD Section
name = petty-cash-api
network = sicepatnet

urlRepo = https://gitlab.com/sicepat-workspace/petty-cash-api
urlPipeline = $(URL_PIPELINE)
urlSlackWebhook = $(URL_SLACK_WEBHOOK)

envFile = $(ENV_FILE)

dockerHost = registry.gitlab.com
dockerUser = $(DOCKER_USER)
dockerPass = $(DOCKER_PASS)
dockerTag = registry.gitlab.com/sicepat-workspace/$(name)/staging
getHash = $(shell git log -1 --pretty=format:"%h")

slackNotify = curl -X POST -H "Content-Type: application/json" -d \
	'{ \
		"attachments": [ \
			{ \
				"color": "$(1)", \
				"blocks": [ \
					{ \
						"type": "header", \
						"text": { \
							"type": "plain_text", \
							"text": "$(2)", \
							"emoji": true \
						} \
					}, \
					{ \
						"type": "section", \
						"text": { \
							"type": "mrkdwn", \
							"text": "$(3)\n$(4)" \
						} \
					}, \
					{ \
						"type": "actions", \
						"elements": [ \
							{ \
								"type": "button", \
								"text": { \
									"type": "plain_text", \
									"text": ":mag: View Pipelines", \
									"emoji": true \
								}, \
								"url": "$(urlPipeline)" \
							} \
						] \
					} \
				] \
			} \
		] \
	}' \
	$(urlSlackWebhook)

slack-notify-start:
	$(call slackNotify,#42e2f4,Petty Cash API :dollar:,:runner: PettyCashAPI building and deploy sequence start, *Project Repo:* $(urlRepo)\n*Hash Commit:* $(getHash))	

slack-notify-finish:
	$(call slackNotify,#37c8ae,Petty Cash API :dollar:,:checkered_flag: PettyCashAPI building and deploy sequence finish, *Project Repo:* $(urlRepo)\n*Hash Commit:* $(getHash))	

slack-notify-failed:
	$(call slackNotify,#ff4646,Petty Cash API :dollar:,:x: PettyCashAPI building and deploy sequence failed, *Project Repo:* $(urlRepo)\n*Hash Commit:* $(getHash))	


build-docker:
	docker build -t $(dockerTag):$(getHash) -t $(dockerTag):latest . --target=prod

push-docker:
	docker login $(dockerHost) -u $(dockerUser) -p $(dockerPass)
	docker push -a $(dockerTag)

clean-docker:
	docker rmi $(dockerTag):$(getHash)

build-and-push: build-docker push-docker clean-docker

login-docker:
	docker login $(dockerHost) -u $(dockerUser) -p $(dockerPass)

pull-docker:
	docker pull $(dockerTag):latest

run-docker:
	- docker stop $(name)
	docker run -d --rm \
	-p 3011:3010 \
	--network $(network) \
	--name $(name) \
	--env-file $(envFile) \
	$(dockerTag):latest

deploy: login-docker pull-docker run-docker
