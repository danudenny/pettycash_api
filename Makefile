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

# Initialize
name = petty-cash-api
network = sicepatnet

urlRepo = https://gitlab.com/sicepat-workspace/petty-cash-api
urlPipeline = $(URL_PIPELINE)
urlSlackWebhook = $(URL_SLACK_WEBHOOK)
urlApiHealthCheck = $(URL_API_HEALTH_CHECK)

envFile = $(ENV_FILE)

dockerHost = registry.gitlab.com
dockerUser = $(DOCKER_USER)
dockerPass = $(DOCKER_PASS)
dockerTag = registry.gitlab.com/sicepat-workspace/$(name)/staging
getHashCommit = $(shell git log -1 --pretty=format:"%h")
getDetailCommit = $(shell git log -1 --pretty=format:"[%an] %s")

apiCheck = $$(curl --write-out "%{http_code}\n" "$(urlApiHealthCheck)" --output output.txt --silent)

# Notify section
notifyHeader = Petty Cash API :dollar:
notifyMeta = *Project Repo:* $(urlRepo)\n*Hash Commit:* $(getHashCommit)

notifyStartColor = 42e2f4
notifyStartDescription = :runner: PettyCashAPI building and deploy sequence start\n$(notifyMeta)

notifySuccessColor = 81b214
notifySuccessDescription = :checkered_flag: PettyCashAPI building and deploy sequence finish\n$(notifyMeta)

notifyFailedColor = ff4646
notifyFailedDescription = :x: PettyCashAPI building and deploy sequence failed\n$(notifyMeta)

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
							"text": "$(3)" \
						} \
					}, \
					{ \
						"type": "context", \
						"elements": [ \
							{ \
								"type": "mrkdwn", \
								"text": "$(4)" \
							} \
						] \
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
								"url": "$(5)" \
							} \
						] \
					} \
				] \
			} \
		] \
	}' \
	$(urlSlackWebhook)

slack-notify-start:
	$(call slackNotify,#$(notifyStartColor),$(notifyHeader),$(notifyStartDescription),$(getDetailCommit),$(urlPipeline))	

slack-notify-finish:
	$(call slackNotify,#$(notifySuccessColor),$(notifyHeader),$(notifySuccessDescription),$(getDetailCommit),$(urlPipeline))	

slack-notify-failed:
	$(call slackNotify,#$(notifyFailedColor),$(notifyHeader),$(notifyFailedDescription),$(getDetailCommit),$(urlPipeline))	


# Pipeline Recipe

build-docker:
	docker build -t $(dockerTag):$(getHashCommit) -t $(dockerTag):latest . --target=prod

push-docker:
	docker login $(dockerHost) -u $(dockerUser) -p $(dockerPass)
	docker push -a $(dockerTag)

clean-docker:
	docker rmi $(dockerTag):$(getHashCommit)

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

health-check:
	for ((i = 0 ; i < 10 ; i++)); do \
		if [ $(apiCheck) = 200 ]; then break; fi; \
		sleep 3; \
		if [ $$i = 9 ]; then exit 1; fi; \
	done
