import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidationError,
  validateSync,
} from 'class-validator';

export type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

export interface Options {
  attachRequestId: boolean;
  environment: string;
  label: string;
  logLevel: LogLevel;
  useLogstashFormat: boolean;
  version: string;
}

export type OptionalProperty<T> = {
  [K in keyof T]?: T[K];
};

export type OptionalConfig = OptionalProperty<Options>;

export class Config implements Options {
  // Whether or not a unique id should be attached to the express request object.
  @IsBoolean()
  @IsOptional()
  readonly attachRequestId: boolean = true;

  // The deployment environment
  @IsString()
  @IsOptional()
  readonly environment: string = 'development';

  // The label of the logger instance.
  @IsString()
  @IsOptional()
  readonly label: string = 'app';

  @IsIn(['log', 'error', 'warn', 'debug', 'verbose'])
  @IsOptional()
  readonly logLevel: LogLevel = 'error';

  // Set to true to use the logstash formatter (typically for kubernetes environments).
  @IsBoolean()
  @IsOptional()
  readonly useLogstashFormat: boolean = false;

  // The app or service version (usually a git commit hash).
  @IsString()
  @IsOptional()
  readonly version: string = 'unknown';

  public static formatValidationErrors(
    errors: ValidationError[],
    details = {},
  ): Record<string, unknown> {
    if (errors.length > 0) {
      for (const error of errors) {
        details =
          error.children && error.children.length > 0
            ? /* istanbul ignore next */ {
                ...details,
                [error.property]: Config.formatValidationErrors(error.children),
              }
            : {
                ...details,
                [error.property]: error.constraints,
              };
      }
    }
    return details;
  }

  public static validate(options?: OptionalConfig): {
    config: Config;
    errors: ValidationError[];
  } {
    // Convert the config object to it's class equivalent.
    const config = plainToInstance(Config, options || {});

    // Validate the config.
    const errors = validateSync(config, {
      forbidUnknownValues: true,
      whitelist: true,
    });

    return {
      config,
      errors,
    };
  }
}
