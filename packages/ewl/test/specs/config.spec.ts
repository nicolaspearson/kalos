import { Config, LogLevel } from '$/config';

describe('Config', () => {
  describe('formatValidationErrors', () => {
    test('should format validation errors correctly', () => {
      const errors = [
        {
          children: [],
          constraints: {
            isIn: 'logLevel must be one of the following values: log, error, warn, debug, verbose',
          },
          property: 'logLevel',
          target: {},
          value: 'not-valid',
        },
      ];
      expect(Config.formatValidationErrors(errors)).toMatchObject({
        logLevel: errors[0].constraints,
      });
    });
  });

  describe('validate', () => {
    test('should transform and validate the provided config correctly', () => {
      const options = {
        attachRequestId: true,
        environment: 'development',
        label: 'app',
        logLevel: 'log' as LogLevel,
        useLogstashFormat: false,
        version: 'unknown',
      };
      expect(Config.validate(options)).toMatchObject({
        config: options,
        errors: [],
      });
    });

    test('should should errors if validation fails', () => {
      const options = {
        attachRequestId: true,
        environment: 'development',
        label: 'app',
        logLevel: 'not-valid' as LogLevel,
        useLogstashFormat: false,
        version: 'unknown',
      };
      expect(Config.validate(options)).toMatchObject({
        config: options,
        errors: [
          expect.objectContaining({
            children: [],
            constraints: {
              isIn: 'logLevel must be one of the following values: log, error, warn, debug, verbose',
            },
            property: 'logLevel',
            target: options,
            value: 'not-valid',
          }),
        ],
      });
    });
  });
});
