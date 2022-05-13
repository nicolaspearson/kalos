import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { LogLevel } from '@nestjs/common';

import { DatabaseConfig } from '$/common/config/database/database.config';
import { Environment } from '$/common/enum/environment.enum';

/**
 * This ConfigService is injected globally by the
 * `TypedConfigModule`: https://github.com/Nikaple/nest-typed-config
 *
 * It can be imported into any provider as follows:
 *
 * @example
 *
 * constructor(private readonly configService: ConfigService) {}
 */
export class ConfigService {
  @IsString()
  readonly apiHost: string = 'localhost';

  @Type(() => Number)
  @IsNumber()
  readonly apiPort: number = 3000;

  @ValidateNested()
  @Type(() => DatabaseConfig)
  @IsNotEmptyObject()
  readonly database!: DatabaseConfig;

  // The deployment environment
  @IsEnum(Environment)
  @IsNotEmpty()
  readonly environment!: Environment;

  @IsIn(['verbose', 'debug', 'log', 'warn', 'error'])
  readonly logLevel: LogLevel = 'error';

  // The node runtime environment
  @IsIn([Environment.Development, Environment.Production])
  readonly nodeEnv: Environment.Development | Environment.Production = Environment.Development;
}
