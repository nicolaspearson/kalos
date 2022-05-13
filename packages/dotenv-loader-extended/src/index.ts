import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { TypedConfigModule } from 'nest-typed-config';

import { ConfigService } from '$/common/config/config.service';

/**
 * It takes a raw config object, transforms all UPPER snake_case keys to camelCase,
 * validates it, and returns a validated instance of the config service.
 *
 * @param {object} rawConfig The raw configuration object received from the loader.
 * @returns The validated instance of the configService.
 */
export function configValidator(rawConfig: Record<string, string>): ConfigService {
  // Convert all environment variables from upper snake
  // case to camel case, e.g. from NODE_ENV to nodeEnv.
  const camelCaseConfig: Record<string, unknown> = transformDeep(rawConfig);

  // Convert the config object to it's class equivalent.
  const configService = plainToInstance(ConfigService, camelCaseConfig);
  const schemaErrors = validateSync(configService, {
    forbidUnknownValues: true,
    whitelist: true,
  });

  // Check for errors
  /* istanbul ignore next */
  if (schemaErrors.length > 0) {
    /* istanbul ignore next */
    console.log(TypedConfigModule.getConfigErrorMessage(schemaErrors));
    /* istanbul ignore next */
    process.exit(1);
  }

  // Return the validated and transformed config.
  return configService;
}

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
function snakeCaseToCamelCase(value: string): string {
  return value.toLowerCase().replace(/(_[a-z])/g, (group) => group.toUpperCase().replace('_', ''));
}
