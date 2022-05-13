import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ValidatorOptions, validateSync } from 'class-validator';
import { DotenvLoaderOptions, TypedConfigModule, dotenvLoader } from 'nest-typed-config';

export interface DotenvLoaderExtendedOptions extends DotenvLoaderOptions {
  /**
   * A boolean value indicating the use of variable transformation.
   *
   * If set to to "true" an .env file that contains UPPER_SNAKE_CASE variables, e.g. NODE_ENV,
   * will be transformed to the camelCase equivalent, e.g. nodeEnv. This works for shallow and
   * deeply nested objects, e.g.
   *
   * Given an .env file containing the variables declarations below
   * and with the separator option set to "__" (double underscore):
   *
   *   API__ACCESS_TOKEN=secret
   *   API__HOST=localhost
   *   API__PORT=3000
   *   DATABASE__TYPE=postgres
   *   DATABASE__CREDENTIALS__DATABASE=kalos
   *   DATABASE__CREDENTIALS__HOST=localhost
   *   DATABASE__CREDENTIALS__PORT=3306
   *   DATABASE__CREDENTIALS__PASSWORD=secret
   *   DATABASE__CREDENTIALS__USERNAME=admin
   *   ENVIRONMENT=development
   *   LOG_LEVEL=debug
   *   NODE_ENV=development
   *   REDIS__DB=0
   *   REDIS__HOST=localhost
   *   REDIS__PORT=6379
   *
   * The following configuration object be produced:
   *
   *   {
   *     "api": {
   *       "host": "localhost",
   *       "port": 3000
   *     },
   *     "database": {
   *       "credentials": {
   *         "database": "kalos",
   *         "host": "localhost",
   *         "password": "secret",
   *         "port": 3306,
   *         "username": "admin"
   *       },
   *       "type": "postgres"
   *     },
   *     "environment": "development",
   *     "logLevel": "debug",
   *     "nodeEnv": "development",
   *     "redis": {
   *       "db": 0,
   *       "host": "localhost",
   *       "port": 6379
   *     }
   *   }
   *
   * This example assumes that your configuration is similar to: ./test/example/config-service.ts
   */
  transformFromUpperSnakeCase?: boolean;
}

/**
 * Dotenv loader extended loads configurations using `dotenv`.
 *
 * @param options The loader options.
 * @returns The parsed configuration object.
 */
export const dotenvLoaderExtended = (options: DotenvLoaderExtendedOptions = {}) => {
  return (): Record<string, unknown> => {
    let config: Record<string, unknown> = dotenvLoader({ ...options })();
    if (options.transformFromUpperSnakeCase) {
      // Convert all environment variables from upper snake
      // case to camel case, e.g. from NODE_ENV to nodeEnv.
      config = transformDeep(config);
    }
    return config;
  };
};

/**
 * Transforms all keys in an object from snake_case
 * to camelCase (including deeply nested objects).
 *
 * @param {object} rawConfig The raw configuration object received from the loader.
 * @param {object} config The partially transformed config object.
 * @returns The transformed config object.
 */
export function transformDeep(
  rawConfig: Record<string, unknown>,
  config: Record<string, unknown> = {},
): Record<string, unknown> {
  for (const [k, value] of Object.entries(rawConfig)) {
    // Convert the key from UPPER snake_case to camelCase.
    const key = snakeCaseToCamelCase(k);
    // Check if this is a nested object.
    if (typeof value === 'object') {
      // Call the function recursively until we have processed all nested objects.
      config[key] = transformDeep(
        value as Record<string, unknown>,
        (config[key] || {}) as Record<string, unknown>,
      );
    } else {
      // Set the config property using the camelCased key and associated value.
      config[key] = value;
    }
  }
  // Finally, return the transformed config object.
  return config;
}

/**
 * Converts an UPPER snake_case string to camelCase.
 *
 * @param {string} value The UPPER snake_case string to convert.
 * @returns The converted camelCase string.
 */
export function snakeCaseToCamelCase(value: string): string {
  return value.toLowerCase().replace(/(_[a-z])/g, (group) => group.toUpperCase().replace('_', ''));
}

/**
 * It takes a raw config object, transforms all UPPER snake_case keys to camelCase,
 * validates it, and returns a validated instance of the config service.
 *
 * @param {object} rawConfig The raw configuration object received from the loader.
 * @returns The validated instance of the configService.
 */
export function validateWithClassValidator<T extends object>(
  rawConfig: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Config: ClassConstructor<T>,
  options?: Partial<ValidatorOptions>,
): T {
  // Convert the config object to it's class equivalent.
  const config = plainToInstance(Config, rawConfig);
  const schemaErrors = validateSync(config, {
    forbidUnknownValues: true,
    whitelist: true,
    ...options,
  });

  // Check for errors
  if (schemaErrors.length > 0) {
    const message = TypedConfigModule.getConfigErrorMessage(schemaErrors);
    throw new Error(message);
  }

  // Return the validated and transformed config.
  return config;
}
