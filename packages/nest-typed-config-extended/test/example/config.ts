import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsNotEmpty, IsNotEmptyObject, ValidateNested } from 'class-validator';

import { ApiConfig } from './api/api.config';
import { DatabaseConfig } from './database/database.config';
import { Environment } from './enum/environment.enum';
import { LogLevel } from './enum/log-level.enum';
import { RedisConfig } from './redis/redis.config';

export class Config {
  @ValidateNested()
  @Type(() => ApiConfig)
  @IsNotEmptyObject()
  readonly api!: ApiConfig;

  @ValidateNested()
  @Type(() => DatabaseConfig)
  @IsNotEmptyObject()
  readonly database!: DatabaseConfig;

  // The deployment environment
  @IsEnum(Environment)
  @IsNotEmpty()
  readonly environment!: Environment;

  @IsEnum(LogLevel)
  readonly logLevel: LogLevel = LogLevel.Error;

  // The node runtime environment
  @IsIn([Environment.Development, Environment.Production])
  readonly nodeEnv: Environment.Development | Environment.Production = Environment.Development;

  @ValidateNested()
  @Type(() => RedisConfig)
  @IsNotEmptyObject()
  readonly redis!: RedisConfig;
}
