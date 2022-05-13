import { DynamicModule } from '@nestjs/common';
import { DotenvLoaderOptions, TypedConfigModule, dotenvLoader } from 'nest-typed-config';

import { ConfigService } from '$/common/config/config.service';
import { configValidator } from '$/common/config/config.validator';

export function createTypedConfigModule(options?: DotenvLoaderOptions): DynamicModule {
  return TypedConfigModule.forRoot({
    isGlobal: true,
    load: dotenvLoader({
      ...options,
      envFilePath: ['.env'],
      separator: '__',
    }),
    schema: ConfigService,
    validate: configValidator,
  });
}
