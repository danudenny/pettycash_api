import * as dotEnvExtended from 'dotenv-extended';
import { default as dotEnvParseVariables } from 'dotenv-parse-variables';
import * as path from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { CustomNamingStrategy } from './utils/CustomNamingStrategy';

// Load `.env.defaults` then `.env` file.
// `load()` only returning from these files!
const fileEnvs = dotEnvExtended.load({
  errorOnMissing: true, // ensure to validate the schema throw error if not valid.
});

// Load `.env.defaults` then `.env` file and include OS Env.
const osEnvs = dotEnvParseVariables(
  dotEnvExtended.load({
    includeProcessEnv: true, // used when you want include OS to the object.
    overrideProcessEnv: false, // if true will override OS Env with .env file.
  }),
);

// The purpose of this thing is
// We want to get value from OS Env
// But only the key from declared .env file.
const envs: any = {};
for (const key of Object.keys(fileEnvs)) {
  envs[key] = osEnvs[key];
}

if (envs.DEBUG) {
  // tslint:disable-next-line: no-console
  console.dir(envs, { colors: true, depth: null });
}

export class LoaderEnv {
  public static envs = envs;

  public static isProduction() {
    return envs.NODE_ENV === 'production';
  }

  public static isDebugMode() {
    return envs.DEBUG === true;
  }

  public static getTypeOrmConfig(useReplication = false): TypeOrmModuleOptions {
    let config: PostgresConnectionOptions = {
      type: 'postgres',
      cli: {
        migrationsDir: 'src/migrations',
      },
      entities: [path.join(__dirname, '../', '**/*.entity{.ts,.js}')],
      migrationsTableName: 'typeorm_migrations',
      migrations: [path.join(__dirname, '../', 'migrations/*.ts')],
      logging: LoaderEnv.isDebugMode(),
      namingStrategy: new CustomNamingStrategy(),
      cache: {
        type: 'redis',
        options: {
          host: envs.REDIS_CACHE_HOST,
          port: envs.REDIS_CACHE_PORT,
          password: envs.REDIS_CACHE_PASSWORD,
          db: envs.REDIS_CACHE_DB,
        },
      },
    };

    const ssl = LoaderEnv.envs.POSTGRES_USE_SSL || false;
    const dbMaster = {
      host: envs.POSTGRES_HOST,
      port: envs.POSTGRES_PORT,
      username: envs.POSTGRES_USER,
      password: envs.POSTGRES_PASSWORD,
      database: envs.POSTGRES_DATABASE,
      ssl,
    };

    if (useReplication || LoaderEnv.isProduction()) {
      let dbSlaves = LoaderEnv.envs.POSTGRES_SLAVE_URLS;
      let slaves = [];

      if (dbSlaves) {
        if (!Array.isArray(dbSlaves)) {
          dbSlaves = [dbSlaves];
        }
        slaves = dbSlaves.map((c) => ({ url: c, ssl }));
      }

      config = Object.assign(
        {
          replication: {
            master: dbMaster,
            slaves,
          },
        },
        config,
      );
    } else {
      config = Object.assign(dbMaster, config);
    }

    return config;
  }
}
