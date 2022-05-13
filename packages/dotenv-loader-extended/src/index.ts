import { DotenvLoaderOptions, dotenvLoader } from 'nest-typed-config';
export interface DotenvLoaderExtendedOptions extends DotenvLoaderOptions {
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
    let config: Record<string, unknown> = dotenvLoader(options)();
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
