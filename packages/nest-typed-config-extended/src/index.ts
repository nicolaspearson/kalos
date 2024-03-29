import { DotenvLoaderOptions, dotenvLoader } from 'nest-typed-config';

export {
  /* istanbul ignore next */
  DirectoryLoaderOptions,
  /* istanbul ignore next */
  FileLoaderOptions,
  /* istanbul ignore next */
  RemoteLoaderConfigType,
  /* istanbul ignore next */
  RemoteLoaderOptions,
  /* istanbul ignore next */
  SelectConfigOptions,
  /* istanbul ignore next */
  TypedConfigModuleOptions,
  /* istanbul ignore next */
  directoryLoader,
  /* istanbul ignore next */
  fileLoader,
  /* istanbul ignore next */
  remoteLoader,
  /* istanbul ignore next */
  selectConfig,
} from 'nest-typed-config';

export { TypedConfigModuleExtended } from './typed-config-extended.module';

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
   *   DATABASE__CREDENTIALS__PORT=5432
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
   *         "port": 5432,
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
    // eslint-disable-next-line unicorn/prefer-ternary
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
  return value
    .toLowerCase()
    .replaceAll(/(_[a-z])/g, (group) => group.toUpperCase().replace('_', ''));
}
