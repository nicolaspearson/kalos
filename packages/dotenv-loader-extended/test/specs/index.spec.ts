import { TypedConfigModule, selectConfig } from 'nest-typed-config';

import { dotenvLoaderExtended, transformDeep, validateWithClassValidator } from '../../src/index';
import { Config } from '../example/config';

describe('Dotenv Loader Extended', () => {
  describe('dotenvLoaderExtended', () => {
    const configModule = TypedConfigModule.forRoot({
      load: dotenvLoaderExtended({
        ignoreEnvFile: true,
        ignoreEnvVars: false,
        separator: '__',
        transformFromUpperSnakeCase: true,
      }),
      schema: Config,
      validate: validateWithClassValidator as any, // TODO: FIX THIS!
    });

    const config = selectConfig(configModule, Config);

    const dotenvVariables = dotenvLoaderExtended({
      ignoreEnvFile: true,
      ignoreEnvVars: false,
      separator: '__',
      transformFromUpperSnakeCase: true,
    })();

    test('should load the config correctly via the typed config module', () => {
      expect(config).toMatchObject({
        api: { host: 'localhost', port: 3000 },
        database: {
          credentials: {
            database: 'kalos',
            host: 'localhost',
            password: 'secret',
            port: 3306,
            username: 'admin',
          },
          type: 'postgres',
        },
        environment: 'development',
        logLevel: 'debug',
        nodeEnv: 'development',
        redis: { db: 0, host: 'localhost', port: 6379 },
      });
    });

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
        DATABASE__CREDENTIALS__PORT: '3306',
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
            port: '3306',
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
        // TODO: Complete this properly
        api: { host: config.api.host, port: '3000' },
        database: {
          credentials: {
            database: config.database.credentials.database,
            host: config.database.credentials.host,
            password: config.database.credentials.password,
            port: '3306',
            username: config.database.credentials.username,
          },
          type: config.database.type,
        },
        environment: 'development',
        logLevel: 'debug',
        nodeEnv: 'development',
        redis: { db: '0', host: 'localhost', port: '6379' },
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
