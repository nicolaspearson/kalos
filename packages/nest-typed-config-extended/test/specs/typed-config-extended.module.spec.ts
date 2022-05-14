import { selectConfig } from 'nest-typed-config';

import { TypedConfigModuleExtended, dotenvLoaderExtended } from '../../src/index';
import { Config } from '../example/config';

describe('Typed Config Module Extended', () => {
  describe('TypedConfigModuleExtended', () => {
    test('should load the config correctly via the typed config module', () => {
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

      expect(config).toMatchObject({
        api: { host: 'localhost', port: 3000 },
        database: {
          credentials: {
            database: 'kalos',
            host: 'localhost',
            password: 'secret',
            port: 5432,
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

    test('throws if an invalid config is provided', () => {
      expect(() =>
        TypedConfigModuleExtended.forRoot({
          load: dotenvLoaderExtended({
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            separator: '__',
            transformFromUpperSnakeCase: true,
          }),
          schema: Config,
        }),
      ).toThrowError();
    });
  });
});
