import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNotEmptyObject, ValidateNested } from 'class-validator';

import { DatabaseCredentialsConfig } from './database-credentials.config';

export class DatabaseConfig {
  @ValidateNested()
  @Type(() => DatabaseCredentialsConfig)
  @IsNotEmptyObject()
  readonly credentials!: DatabaseCredentialsConfig;

  // The database engine.
  @IsIn(['postgres'])
  @IsNotEmpty()
  readonly type: 'postgres' = 'postgres';
}
