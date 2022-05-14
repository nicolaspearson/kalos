import { selectConfig } from 'nest-typed-config';

import { TypedConfigModuleExtended, dotenvLoaderExtended, transformDeep } from '../../src/index';
import { Config } from '../example/config';

describe('Dotenv Loader Extended', () => {
  describe('dotenvLoaderExtended', () => {
    const configModule = TypedConfigModuleExtended.forRoot({
      load: dotenvLoaderExtended({
        ignoreEnvFile: true,
        ignoreEnvVars: false,
        separator: '__',
        transformFromUpperSnakeCase: true,
      }),
      schema: Config,
    });

    const config = selectConfig(configModule, Config);

    const dotenvVariables = dotenvLoaderExtended({
      ignoreEnvFile: true,
      ignoreEnvVars: false,
      separator: '__',
      transformFromUpperSnakeCase: true,
    })();

    test('should load the config without options', () => {
      const dotenvVariables = dotenvLoaderExtended()();
      expect(dotenvVariables).toMatchObject({
        /* eslint-disable @typescript-eslint/naming-convention */
        API__ACCESS_TOKEN: 'secret',
        API__HOST: 'localhost',
        API__PORT: '3000',
        DATABASE__TYPE: 'postgres',
        DATABASE__CREDENTIALS__DATABASE: 'kalos',
        DATABASE__CREDENTIALS__HOST: 'localhost',
        DATABASE__CREDENTIALS__PORT: '5432',
        DATABASE__CREDENTIALS__PASSWORD: 'secret',
        DATABASE__CREDENTIALS__USERNAME: 'admin',
        ENVIRONMENT: 'development',
        LOG_LEVEL: 'debug',
        NODE_ENV: 'development',
        REDIS__DB: '0',
        REDIS__HOST: 'localhost',
        REDIS__PORT: '6379',
        /* eslint-enable @typescript-eslint/naming-convention */
      });
    });

    test('should transform dotenv variables correctly', () => {
      expect(dotenvVariables).toMatchObject({
        api: { host: 'localhost', port: '3000' },
        database: {
          credentials: {
            database: 'kalos',
            host: 'localhost',
            password: 'secret',
            port: '5432',
            username: 'admin',
          },
          type: 'postgres',
        },
        environment: 'development',
        logLevel: 'debug',
        nodeEnv: 'development',
        redis: { db: '0', host: 'localhost', port: '6379' },
      });
    });

    test('config loaded via the typed config module should match dotenv variables', () => {
      expect(dotenvVariables).toMatchObject({
        api: { host: config.api.host, port: String(config.api.port) },
        database: {
          credentials: {
            database: config.database.credentials.database,
            host: config.database.credentials.host,
            password: config.database.credentials.password,
            port: String(config.database.credentials.port),
            username: config.database.credentials.username,
          },
          type: config.database.type,
        },
        environment: config.environment,
        logLevel: config.logLevel,
        nodeEnv: config.nodeEnv,
        redis: {
          db: String(config.redis.db),
          host: config.redis.host,
          port: String(config.redis.port),
        },
      });
    });
  });

  describe('transformDeep', () => {
    test('should convert a deeply nested config object correctly', () => {
      expect(
        transformDeep({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          LEVEL1: { LEVEL2: { LEVEL3: { LEVEL4: { LEVEL5: { NAME: 'NESTED' } } } } },
        }),
      ).toMatchObject({
        level1: { level2: { level3: { level4: { level5: { name: 'NESTED' } } } } },
      });
    });
  });
});
