![Sicepat](https://www.sicepat.com/images/logo-sicepat-2.png)

# Sicepat Petty Cash API

This project is for handling Internal Petty Cash Operation from Head Office to Branch and vice-versa.

## Tech Stack

- [Node.js](https://nodejs.org/download/release/v12.16.0/) Node.js version `12.16`.
- [Yarn](https://yarnpkg.com) for Package Manager.
- [Nest.js](https://github.com/nestjs/nest) as the framework.
- ~~[MongoDB](https://docs.mongodb.com/manual/installation/) for Database Storage.~~
- [Redis](https://redis.io/) for Backing Bull and Key-Value storage.
- ~~[Kafka](https://kafka.apache.org/) for Message Brokers.~~
- ~~[Mongoose](https://mongoosejs.com/) for MongoDB object modeling.~~
- ~~[Kafka.js](https://kafka.js.org/) for Kafka client.~~
- [Bull](https://github.com/OptimalBits/bull) for Job Queue.
- [Swagger](https://docs.nestjs.com/openapi/introduction) for API Docs.

---

## Development

### Prerequisites

For simplified our development, we are choosing [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/) to manage dependencies application.
If you don't have docker on your machine, please install it first before continue to the next step.

### Build and Run application

We are using [dotenv-extended](https://github.com/keithmorris/node-dotenv-extended) for managing the environment configuration. this library will load `.env.defaults` then `.env` then Operating System Environment, each step will ovveride previous step environment configuration. the environment configuration can be accessed via `process.env.KEY_NAME`.

> Please read [DotEnv Configuration](#DotEnv-Configuration) if you want change or add new environment.

#### Create Environment Configuration

Create `.env` file from defaults example and edit the configuration if needed.

```sh
cp .env.defaults .env
```

#### Run the application

>_This app will use port ~~`9000`, `9092`, `2181`,~~ `6379`, `5432`, `3010` ~~and `270172`~~. Please make sure there is no active application using these port on your host machine._

```sh
docker-compose up
```

you also can passing `-d` param if you want to run the container in background.

Wait until all docker images downloaded and the containers spin up.

This command will create these containers:

- `sicepat_redis` using docker image [redis:5](https://hub.docker.com/_/redis) and with exposed port to `6379`.
- ~~`sicepat_mongo` using docker image [mongo:latest](https://hub.docker.com/_/mongo) and with exposed port to `270172`.~~
- `sicepat_postgres` using docker image [postgres:10-alpine](https://hub.docker.com/_/postgres) and with exposed port to `5432`.
- ~~`sicepat_zookeper` using docker image [wurstmeister/zookeeper:latest](https://hub.docker.com/r/wurstmeister/zookeeper) and with exposed port to `2181`.~~
- ~~`sicepat_kafka` using docker image [wurstmeister/kafka:2.12-2.5.0](https://hub.docker.com/r/wurstmeister/kafka) and with exposed port to `9092`.~~
- ~~`sicepat_kafdrop` using docker image [obsidiandynamics/kafdrop:latest](https://hub.docker.com/r/obsidiandynamics/kafdrop) and with exposed port to `9000`.~~
- `sicepat_app` using docker image version `latest` (builded from the `Dockerfile`) and with exposed port to `3010`.

_Take a look on [docker-compose command](#docker-compose-command) for another useful command._

---

## Usage

### API Blueprint

List API Blueprint contracts can be found in `contracts/` directory. you can run the API as mock server using [drakov](https://www.npmjs.com/package/drakov) package (_install as global `npm i -g drakov`_) and run it by `yarn drakov:start`. Mock server should be available and accessible on [http://localhost:3100](http://localhost:3100).

### API Docs (swagger)

The swagger UI can be accessed on route URI `/docs` e.g: [http://localhost/docs](http://localhost:3010/docs).

### Bull Dashboard

To access bull dashboard go to `/bull/queues` e.g: [http://localhost/bull/queues](http://localhost:3010/bull/queues)

<!-- Un-comment when we implement it
### Kafka UI Monitoring

We are using [Kafdrop](https://github.com/obsidiandynamics/kafdrop) for the Kafka web UI Monitoring. To access Kafdrop go to [http://localhost:9000](http://localhost:9000)
![KafkaDrop](https://raw.githubusercontent.com/obsidiandynamics/kafdrop/master/docs/images/overview.png)

### Publish & Subscribe Kafka Message

We are providing example to publish and subscribe message to Kafka.

You can try to access [http://localhost/send/consumer](http://localhost:3010/send/consumer) for publishing the message. and you can watch the application log that the message successfully published and received.
-->

### API Usage

When building API, we are using [TypeORM](https://github.com/typeorm/typeorm) for our [ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping). TypeORM it self has a lot of features, but we need a another custom packages to handle our needed, so we are including custom packages that depends on TypeORM. we are using [typeorm-query-builder-wrapper](https://github.com/arjunsumarlan/typeorm-query-builder-wrapper) and [tofo - TypeORM FindOptions builder](https://github.com/repodevs/tofo), please take a look on these repository for how to use these packages.

TODO: add api usage example.

### Model Migration

After creating new model entity in `src/model/` make sure to generate new migrations file and apply the migration.

#### Generate Migration file

```sh
yarn typeorm migration:generate -p -n 'YourMigrationName'
```

> RULE:
>
> 1. Always use `-p` argument for make the migration file more readable.
> 2. Use `CAPITAL` character in begining of migration name. this name will be used as Class name in the code. e.g: use `BankTransfer` instead of `bankTransfer`

new file will be created on `src/migrations/`.

after migration file created, you now can apply the migration to database.

#### Apply Migration file

To apply migration file to the database use command:

```sh
yarn typeorm migration:run
```

#### Revert Migration

Instead of deleting manual changes in database, consider to use Revert command.

```sh
yarn typeorm migration:revert
```

---

## Others

### DotEnv Configuration

The current dotenv configuration has 3 files:

- `.env.defaults` used for defined default Environment.
- `.env` used for ovveriding `.env.defaults` file.
- `.env.schema` used for environment validation.

Let's take a example how to use this env file.

```markdown
I want to change `MONGODB_URL` to another URL instead of `mongodb://my_mongo:27017/nestjs`.

you can create `.env` file then put `MONGODB_URL=mongodb://your_new_server:27017/your_new_db` instead of changing directly on `.env.defaults`.
```

```markdown
I want to add new Environment and this Environment is required, if user don't set this Environment the application should not be started.

you should put your new Environment on `.env.schema` file. this file will ensure your new Environment should be set before the application running. and optionally you can define default value of the Environment in `.env.defaults` file.
```

### Updating `hosts` file.

By default our Environment configuration using docker `host` name instead of an IP Address. this is no problem when you running all app in container (with same network). but problem will come if you run the App in your host machine (e.g: Laptop). to fix this problem, consider to update your `hosts` file machine or updating your DotEnv file (`.env`).

OPTION 1: Updating your `hosts` file machine:

In UNIX-_like_ machine (e.g: Linux, MacOS), open file `/etc/hosts` with superuser account or use `sudo`.
```sh
sudo vim /etc/hosts
```
and then add the following config:
```sh
127.0.0.1 postgres
127.0.0.1 redis
```

In Windows:   
TODO: -    
_Switch to UNIX-*like* OS please 🙃_

OPTION 2: updating your DotEnv (`.env`) file e.g:
```sh
...
POSTGRES_HOST=127.0.0.1
REDIS_BULL_HOST=127.0.0.1
REDIS_CACHE_HOST=127.0.0.1
...
```

### docker-compose command

Some useful docker-compose command for development

#### Watch container logs

If you want to watch the container logs created by docker-compose you can use command:

```sh
docker-compose -f path/to/docker-compose-file.yml logs -f
```

the `-f` param in last command used for keep following the logs (_it's like `tail -f` command on *nix_)

#### Restart container

In case your container stoped/exited you can restart it using

```sh
docker-compose -f path/to/docker-compose-file.yml restart
```

#### Rebuild container

In the sicepatApp service config, we defined `node_modules` as an anonymous volume to prevent our host files from overriding the directory. So if we were to **add a new package** by using npm install, the package wouldn’t be available in the Docker context, and the application would crash.

Even if you run `docker-compose down` and then `docker-compose up` again in order to start over, the volume would stay the same. It won’t work because anonymous volumes aren’t removed until their parent container is removed.

To fix this, we should rebuild the container with the following command:

```sh
docker-compose up --build -V
```

The `--build` parameter will make sure the npm install is run (during the build process), and the `-V` argument will remove any anonymous volumes and create them again.

---

## Deployment

TODO
