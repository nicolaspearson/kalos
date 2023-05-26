import { DynamicModule, Module } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ValidatorOptions, validateSync } from 'class-validator';
import { TypedConfigModule, TypedConfigModuleOptions } from 'nest-typed-config';

@Module({})
export class TypedConfigModuleExtended {
  public static forRoot<T extends object>(options: TypedConfigModuleOptions): DynamicModule {
    return TypedConfigModule.forRoot({
      ...options,
      validate:
        options.validate ||
        (((
          rawConfig: Record<string, unknown>,
          configClass: ClassConstructor<T>,
          options?: Partial<ValidatorOptions>,
        ) =>
          TypedConfigModuleExtended.validateWithClassValidator<T>(
            rawConfig,
            configClass,
            options,
          )) as (config: Record<string, unknown>) => Record<string, unknown>),
    });
  }

  /**
   * It takes a raw config object, transforms all UPPER snake_case keys to camelCase,
   * validates it, and returns a validated instance of the config service.
   *
   * @param {object} rawConfig The raw configuration object received from the loader.
   * @returns The validated instance of the configService.
   */
  private static validateWithClassValidator<T extends object>(
    rawConfig: Record<string, unknown>,
    configClass: ClassConstructor<T>,
    options?: Partial<ValidatorOptions>,
  ): T {
    // Convert the config object to it's class equivalent.
    const config = plainToInstance(configClass, rawConfig);
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
}
