# Initialize
name = petty-cash-api
network = sicepatnet

envFile = $(ENV_FILE)
servicePort = $(SERVICE_PORT)

dockerHost = $(DOCKER_HOST)
dockerUser = $(DOCKER_USER)
dockerPass = $(DOCKER_PASS)
dockerTag = $(DOCKER_TAG)

# Pipeline Recipe
build-docker:
	docker build -t $(dockerTag) .

push-docker:
	@docker login $(dockerHost) -u $(dockerUser) -p $(dockerPass)
	docker push -a $(dockerTag)

clean-docker:
	docker rmi $(dockerTag)

build-push: build-docker push-docker clean-docker

login-docker:
	@docker login $(dockerHost) -u $(dockerUser) -p $(dockerPass)

pull-docker:
	docker pull $(dockerTag):latest

run-docker:
	- docker stop $(name)
	docker run -d --rm \
	-p $(servicePort):3010 \
	--network $(network) \
	--name $(name) \
	--env-file $(envFile) \
	$(dockerTag):latest

deploy: login-docker pull-docker run-docker

