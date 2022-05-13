import { dotenvLoader } from 'nest-typed-config';

import { configValidator, transformDeep } from '$/common/config/config.validator';
import { Environment } from '$/common/enum/environment.enum';

import { configService } from '#/common/config';

describe('Config Validator', () => {
  describe('configValidator', () => {
    test('should transform and validate an environment config correctly', () => {
      const environmentVariables = dotenvLoader({
        ignoreEnvFile: true,
        ignoreEnvVars: false,
        separator: '__',
      })();
      expect(configValidator(environmentVariables)).toMatchObject({
        database: {
          type: configService.database.type,
          credentials: {
            database: configService.database.credentials.database,
          },
        },
        environment: Environment.Test,
        nodeEnv: Environment.Development,
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
