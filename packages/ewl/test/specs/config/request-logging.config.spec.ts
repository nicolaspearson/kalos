import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { RequestLoggingConfig } from '../../../src/config';

describe('Request Logging Config', () => {
  const options = {
    allowFilterOutWhitelistedRequestBody: undefined,
    baseMeta: undefined,
    bodyBlacklist: ['accessToken', 'password', 'refreshToken', 'token'],
    bodyWhitelist: undefined,
    colorize: false,
    expressFormat: true,
    format: undefined,
    headerBlacklist: ['cookie', 'token'],
    ignoreRoute: expect.any(Function),
    ignoredRoutes: undefined,
    meta: true,
    metaField: 'express',
    msg: '{{req.method}} {{req.url}}',
    requestField: undefined,
    requestWhitelist: ['body', 'headers', 'method', 'params', 'query', 'url'],
    responseField: undefined,
    responseWhitelist: ['body', 'headers', 'statusCode'],
    skip: undefined,
    statusLevels: true,
  };

  describe('validate', () => {
    test('should populate configuration defaults correctly', () => {
      const config = plainToInstance(RequestLoggingConfig, {});
      expect(config).toMatchObject(options);
    });

    test('should create errors if validation fails', () => {
      const config = plainToInstance(RequestLoggingConfig, { ...options, colorize: 'some-string' });
      const errors = validateSync(config, {
        forbidUnknownValues: true,
        whitelist: true,
      });
      expect(errors).toMatchObject([
        {
          children: [],
          constraints: {
            isBoolean: 'colorize must be a boolean value',
          },
          property: 'colorize',
          target: { ...options, colorize: 'some-string' },
          value: 'some-string',
        },
      ]);
    });
  });
});
