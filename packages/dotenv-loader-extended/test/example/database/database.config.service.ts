import * as path from 'path';

import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { ConfigService } from '$/common/config/config.service';
import { Environment } from '$/common/enum/environment.enum';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const { nodeEnv } = this.configService;
    const { dropSchema, entities, migrations, migrationsRun, synchronize, type } =
      this.configService.database;
    const { database, schema, host, port, password, username } =
      this.configService.database.credentials;

    // Configure the base data source options.
    return {
      database,
      schema,
      host,
      port,
      password,
      username,
      type,

      // Entities
      entities: [path.resolve(entities[0])],

      // Logging
      logging: nodeEnv === Environment.Production ? [] : ['error', 'schema', 'warn'],

      // Migrations
      migrationsRun,
      migrationsTransactionMode: 'all',
      migrations: [path.resolve(migrations[0])],

      // Synchronization
      dropSchema: nodeEnv === Environment.Production ? false : dropSchema,
      synchronize: nodeEnv === Environment.Production ? false : synchronize,
    };
  }
}
